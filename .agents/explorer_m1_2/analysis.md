# Milestone 1 Analysis Report: Settings UI and Firestore Security Rules

## Executive Summary
This report analyzes the Firestore Security Rules (`firestore.rules`) and the Settings UI (`src/pages/admin/Settings.jsx`) for Milestone 1. Our read-only investigation has uncovered a critical authorization bug where the `ownerEmail` in `settings/adminConfig` is verified on the frontend but ignored in backend security rules. Additionally, we identified a functional conflict between the requested unauthenticated update restrictions and the existing checkout flow. We outline a unified, backward-compatible implementation strategy to address these findings.

---

## 1. Catalog of Findings & Code Structure

### A. Firestore Security Rules Structure (`firestore.rules`)
Currently, security rules verify admin/employee status via the `isAuthorized()` function:
```javascript
// firestore.rules
function isSuperAdmin() {
  return request.auth != null && request.auth.token.email == "minhazuddin7827@gmail.com";
}

function isAuthorized() {
  return isSuperAdmin() || 
         (request.auth != null && 
          exists(/databases/$(database)/documents/settings/adminConfig) &&
          request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails);
}
```
For reservations:
```javascript
match /reservations/{document=**} {
  allow create: if true;
  allow read, update, delete: if isAuthorized();
}
```

### B. Settings UI & Configuration (`src/pages/admin/Settings.jsx`)
- Settings are loaded from `settings/master` and `settings/adminConfig`.
- `adminConfig` contains:
  - `ownerEmail` (string)
  - `allowedEmails` (array of strings)
- Legacy booking fields in `settings/master`:
  - `bookingEnabled` (boolean)
  - `requirePreOrderForBooking` (boolean)

---

## 2. Key Discoveries and Architectural Mismatches

### Discovery 1: Owner Email Authorization Bypass Mismatch (High Severity)
- **Observation**: The frontend (`src/pages/admin/Login.jsx` and `src/components/DashboardLayout.jsx`) considers a user an admin/owner if their email matches `adminConfig.ownerEmail`. However, `firestore.rules`'s `isAuthorized()` function only checks if the user is the hardcoded super admin or is listed in `adminConfig.allowedEmails`.
- **Impact**: If an owner email is defined in `ownerEmail` but not explicitly duplicated in the `allowedEmails` array, they will be logged into the dashboard but blocked from saving settings or modifying collections at the database level.
- **Resolution**: Align backend and frontend auth by updating `isAuthorized()` to explicitly check `ownerEmail`.

### Discovery 2: Unauthenticated Update Limitation Conflict (Medium Severity)
- **Observation**: The user request specifies: "STRICTLY limit [public updates] to changing the status field to 'cancelled'. Ensure no other fields can be updated by unauthenticated clients."
- **Conflict**: In the optional pre-order reservation flow (traced in `src/pages/public/Checkout.jsx:128`), the client updates the reservation to add `linkedOrderId` after the checkout completes:
  ```javascript
  await updateDoc(doc(db, 'reservations', pendingRes.id), {
    linkedOrderId: orderNumber
  });
  ```
  If unauthenticated updates are strictly restricted to `status = 'cancelled'`, then the checkout linking of order IDs will fail with `Permission Denied`.
- **Resolution Paths**:
  - **Path A (Strict Compliance)**: Block everything except `status = 'cancelled'` updates for public users. (Note: Breaks optional pre-order linking in `Checkout.jsx`).
  - **Path B (Functional Completeness - Recommended)**: Allow unauthenticated updates to either change `status` to `'cancelled'` OR add `linkedOrderId` (only if not already set, to prevent tampering).

---

## 3. Recommended Implementation Strategy

### A. Firestore Rules Updates (`firestore.rules`)
We recommend updating the reservations rule and `isAuthorized()` to resolve the mismatches:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSuperAdmin() {
      return request.auth != null && request.auth.token.email == "minhazuddin7827@gmail.com";
    }
    
    // Fixed: Checks both allowedEmails and ownerEmail
    function isAuthorized() {
      return isSuperAdmin() || 
             (request.auth != null && 
              exists(/databases/$(database)/documents/settings/adminConfig) &&
              (
                request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails ||
                request.auth.token.email == get(/databases/$(database)/documents/settings/adminConfig).data.ownerEmail
              ));
    }

    match /settings/{document=**} {
      allow read: if true;
      allow write: if isAuthorized();
    }
    
    match /menu/{document=**} {
      allow read: if true;
      allow write: if isAuthorized();
    }
    
    match /orders/{document=**} {
      allow create: if true;
      allow read, update, delete: if isAuthorized();
    }

    match /reservations/{reservationId} {
      allow create: if true;
      
      // Allow single document retrieval by ID publicly; list/queries restricted to admins to prevent PII exposure
      allow get: if true;
      allow list: if isAuthorized();
      
      // Path B: Allow public cancels and order-linking, while keeping other fields secure
      allow update: if isAuthorized() || (
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
        request.resource.data.status == 'cancelled'
      ) || (
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
        !('linkedOrderId' in resource.data)
      );

      allow delete: if isAuthorized();
    }

    match /counters/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### B. Settings UI Updates (`src/pages/admin/Settings.jsx`)
To implement `bookingMode` and `maxCapacityPerHour` while maintaining compatibility:

1. **State Initialization**:
   Initialize defaults in the `settings` state:
   ```javascript
   const [settings, setSettings] = useState({
     // ... other fields
     bookingMode: 'enabled',
     maxCapacityPerHour: 30,
   });
   ```

2. **Load Mapping**:
   In the settings `useEffect` fetch block:
   ```javascript
   if (docSnap.exists()) {
     const data = docSnap.data();
     let bookingMode = 'enabled';
     if (data.bookingEnabled === false) {
       bookingMode = 'disabled';
     } else if (data.requirePreOrderForBooking === true) {
       bookingMode = 'preorder';
     }
     setSettings(prev => ({
       ...prev,
       bookingMode,
       maxCapacityPerHour: data.maxCapacityPerHour || 0,
       ...data
     }));
   }
   ```

3. **Save Mapping**:
   In `handleSave`, map `bookingMode` back to the legacy boolean flags before saving:
   ```javascript
   const handleSave = async () => {
     setSaving(true);
     try {
       const updatedSettings = { ...settings };
       if (settings.bookingMode === 'disabled') {
         updatedSettings.bookingEnabled = false;
         updatedSettings.requirePreOrderForBooking = false;
       } else if (settings.bookingMode === 'preorder') {
         updatedSettings.bookingEnabled = true;
         updatedSettings.requirePreOrderForBooking = true;
       } else {
         updatedSettings.bookingEnabled = true;
         updatedSettings.requirePreOrderForBooking = false;
       }
       updatedSettings.maxCapacityPerHour = Number(settings.maxCapacityPerHour) || 0;

       await setDoc(doc(db, 'settings', 'master'), updatedSettings);
       setToast(true);
       setTimeout(() => setToast(false), 3000);
     } catch (error) {
       console.error("Error saving settings:", error);
       alert("Failed to save settings.");
     } finally {
       setSaving(false);
     }
   };
   ```

4. **UI Fields**:
   Replace the checkboxes in the **Reservation Rules** card with:
   ```jsx
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     <div>
       <label className="block text-sm font-medium text-gray-300 mb-2">Booking System Mode</label>
       <select
         name="bookingMode"
         value={settings.bookingMode || 'enabled'}
         onChange={handleChange}
         className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
       >
         <option value="disabled">Disabled</option>
         <option value="enabled">Enabled without mandatory pre-ordering</option>
         <option value="preorder">Enabled with mandatory pre-ordering</option>
       </select>
     </div>

     <div>
       <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Capacity Per Hour</label>
       <input
         type="number"
         name="maxCapacityPerHour"
         min="1"
         value={settings.maxCapacityPerHour ?? ''}
         onChange={handleChange}
         placeholder="e.g. 30"
         className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
         disabled={settings.bookingMode === 'disabled'}
       />
     </div>
   </div>
   ```

---

## 4. Verification Plan

1. **Deploy Rules to Emulator**: Set up local Firebase simulator environment.
2. **Execute Assertions**:
   - public create reservation $\rightarrow$ **Success**
   - public get single reservation by ID $\rightarrow$ **Success**
   - public query list/phone scan reservations $\rightarrow$ **Blocked**
   - public update status to `'cancelled'` $\rightarrow$ **Success**
   - public update status to `'confirmed'` $\rightarrow$ **Blocked**
   - public update any other field (e.g., guest count, date) $\rightarrow$ **Blocked**
   - public update `linkedOrderId` when empty $\rightarrow$ **Success** (Path B) or **Blocked** (Path A)
   - Owner/Admin update any field $\rightarrow$ **Success**
3. **Verify UI Syncing**: Save settings with each mode dropdown value and verify Firestore has updated legacy booleans correctly.
