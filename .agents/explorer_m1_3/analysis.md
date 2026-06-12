# Milestone 1 Analysis: Settings UI and Firestore Rules Updates

## Executive Summary
This report analyzes the codebase for Milestone 1, focusing on the integration of Settings UI updates in `src/pages/admin/Settings.jsx` and Firestore Security Rules updates in `firestore.rules`. It details the Firestore settings document structure, traces the end-to-end reservation flow (including optional/mandatory pre-ordering), and assesses the security risks, edge cases, and side effects of public status updates to `'cancelled'`.

---

## 1. Firestore Settings Schema
The configuration settings for the restaurant are stored in the `settings` collection in Firestore.

### Current Structure
There are two primary documents in the `settings` collection:
1. **`settings/master`**: Stores general restaurant configuration.
   - **Collection**: `settings`
   - **Document ID**: `master`
   - **Existing Fields**:
     - `restaurantName` (string)
     - `themePrimary` (string, hex color code)
     - `languages` (array of strings, e.g., `['en']`)
     - `bankName` (string)
     - `accountNumber` (string)
     - `accountHolder` (string)
     - `tngQrCode` (string, base64 data URL)
     - `tngEwalletLink` (string)
     - `discountPercent` (number)
     - `discountItems` (array of strings, e.g., `['all']`)
     - `taxPercent` (number)
     - `tables` (number / string)
     - `dateFormat` (string)
     - `dashboardBg` (string, base64 data URL)
     - `telegramWebhook` (string)
     - `operatingHoursOpen` (string time, e.g., `'10:00'`)
     - `operatingHoursClose` (string time, e.g., `'22:00'`)
     - `operatingDays` (array of numbers, e.g., `[0,1,2,3,4,5,6]`)
     - `closedDates` (array of strings, e.g., `['2026-06-25']`)
     - `bookingEnabled` (boolean)
     - `requirePreOrderForBooking` (boolean)

2. **`settings/adminConfig`**: Stores access control configurations.
   - **Collection**: `settings`
   - **Document ID**: `adminConfig`
   - **Fields**:
     - `ownerEmail` (string)
     - `allowedEmails` (array of strings representing authorized staff)

### Proposed Fields for Milestone 1
We will introduce two new fields in `settings/master`:
- **`bookingMode`** (string): The mode of the booking system. Possible values:
  - `'disabled'`: Reservations are closed.
  - `'enabled'`: Reservations are open, pre-ordering is optional.
  - `'preorder'`: Reservations are open, pre-ordering is mandatory.
- **`maxCapacityPerHour`** (number): The maximum number of guests/bookings allowed per hour.

### Backward Compatibility Strategy
Since other parts of the application (e.g., `Book.jsx` and `Checkout.jsx`) rely on `bookingEnabled` and `requirePreOrderForBooking`, we must map `bookingMode` back to these properties before saving, and derive `bookingMode` when loading:
- **Load mapping** (in `useEffect` of `Settings.jsx`):
  - If `bookingEnabled === false` $\rightarrow$ `bookingMode = 'disabled'`
  - Else if `requirePreOrderForBooking === true` $\rightarrow$ `bookingMode = 'preorder'`
  - Else $\rightarrow$ `bookingMode = 'enabled'`
- **Save mapping** (in `handleSave` of `Settings.jsx`):
  - If `bookingMode === 'disabled'` $\rightarrow$ `bookingEnabled = false`, `requirePreOrderForBooking = false`
  - If `bookingMode === 'enabled'` $\rightarrow$ `bookingEnabled = true`, `requirePreOrderForBooking = false`
  - If `bookingMode === 'preorder'` $\rightarrow$ `bookingEnabled = true`, `requirePreOrderForBooking = true`
  - Convert `maxCapacityPerHour` to a number using `Number()`.

---

## 2. Reservation Flow Trace
Reservations are managed in `/reservations` collection. 

### A. Creation
Reservations are created via two main flows:
1. **Without Mandatory Pre-ordering (`bookingMode === 'enabled'`)**:
   - In `Book.jsx`, when the customer submits the booking form, `handleSubmit` creates a reservation document:
     ```javascript
     const docRef = await addDoc(collection(db, 'reservations'), {
       ...formData,
       status: 'pending',
       timestamp: serverTimestamp()
     });
     ```
   - If the user subsequently decides to pre-order food (optional pre-order), the reservation ID is stored in `localStorage` and they are redirected to `/order`.
   - Upon completing the checkout in `Checkout.jsx`, the reservation is updated with the order number:
     ```javascript
     await updateDoc(doc(db, 'reservations', pendingRes.id), {
       linkedOrderId: orderNumber
     });
     ```
2. **With Mandatory Pre-ordering (`bookingMode === 'preorder'`)**:
   - In `Book.jsx`, submitting the booking form does not write to Firestore. Instead, it saves the form details in `localStorage` as `pendingReservation` and redirects the user to `/order`.
   - In `Checkout.jsx`, after successful checkout transaction, the reservation document is created:
     ```javascript
     await addDoc(collection(db, 'reservations'), {
       ...pendingRes,
       linkedOrderId: orderNumber,
       status: 'pending',
       timestamp: serverTimestamp()
     });
     ```

### B. Reading
- Public users search for their reservation in `Book.jsx` (Manage Booking tab) using:
  - **Reservation ID (Direct Document Get)**: `getDoc(doc(db, 'reservations', searchVal))`
  - **Phone Number Query**: `query(collection(db, 'reservations'), where('phone', '==', searchVal), where('status', '==', 'confirmed'))`
- *Note:* Currently, the frontend only displays the booking if its status is `'confirmed'`. If it is `'pending'`, the user cannot find it in the search.

### C. Cancellation
- If a reservation is successfully retrieved in `Book.jsx`, the user can click "Cancel Reservation".
- The frontend directly updates the status in Firestore to `'cancelled'`:
  ```javascript
  await updateDoc(doc(db, 'reservations', foundRes.id), {
    status: 'cancelled'
  });
  ```

---

## 3. Security Risks, Edge Cases, and Side Effects
Allowing unauthenticated (public) read and write operations on the `reservations` collection introduces major security and privacy concerns:

### Risk 1: Customer PII Data Leakage (High Severity)
- **Problem**: If the Firestore security rules allow public `read` on the entire `/reservations` collection (which covers both `get` and `list` operations), anyone can execute a collection scan query (`getDocs(collection(db, 'reservations'))`) to fetch every reservation. This leaks customer names, phone numbers, dining times, and notes.
- **Evidence**: `firestore.rules` currently allows read/update only for authorized admins. If we change it to a blanket `allow read: if true;`, list queries are exposed.
- **Recommendation**: Split the read rule into `get` and `list`.
  - Allow unauthenticated `get` (retrieving a single document by its exact ID).
  - Restrict `list` (queries across the collection, including search by phone) to authorized users only (`isAuthorized()`).
  - *Side Effect*: If `list` is blocked for public users, the phone number search in the Manage Booking tab of `Book.jsx` will fail with a permission error. The customer must search using their unique 20-character auto-generated Reservation ID. This is a desirable trade-off as phone-number search allows anyone to search for and view another user's reservation details by simply typing their phone number.

### Risk 2: Unauthorized Cancellation / Trolling (Medium-High Severity)
- **Problem**: Trolls or malicious actors could script cancellations. If they can discover/guess reservation IDs or customer phone numbers, they can set the reservation status to `'cancelled'`.
- **Evidence**: The frontend directly calls `updateDoc` on `/reservations/{docId}` with `{ status: 'cancelled' }`.
- **Recommendation**:
  1. Enforce a strict write rule in `firestore.rules` that only allows unauthenticated updates if **only** the `status` field is changed, and the new value is `'cancelled'`.
  2. Deprecate the search-by-phone feature for public users so they cannot harvest reservation IDs or verify if a phone number has a reservation.
  3. Ensure the reservation ID (document ID) generated by Firestore is cryptographically secure and unguessable (default auto-ID).

### Risk 3: Unauthorized Document Updates / Tampering (High Severity)
- **Problem**: Public users need to update `linkedOrderId` in `Checkout.jsx` (optional pre-order flow), but we must prevent them from modifying other fields like the reservation date, table number, name, or guest counts.
- **Recommendation**: Restrict unauthenticated updates to only allow changing `linkedOrderId` (if not already set) or `status` (if changing to `'cancelled'`).

---

## 4. Recommended Security Rules (`firestore.rules`)
To address these issues, update the `reservations` match block in `firestore.rules` to:

```javascript
    match /reservations/{reservationId} {
      // Allow anyone to request/create a booking
      allow create: if true;
      
      // Allow public to view their specific reservation by ID, but restrict listing/queries to admins
      allow get: if true;
      allow list: if isAuthorized();
      
      // Allow updates only for specific public actions (cancel, link order) or by admins
      allow update: if isAuthorized() || (
        // Case 1: Public cancellation
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
        request.resource.data.status == 'cancelled'
      ) || (
        // Case 2: Public linking of order ID during checkout (only if not already set)
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
        !('linkedOrderId' in resource.data)
      );

      // Restrict delete to authorized admins/employees
      allow delete: if isAuthorized();
    }
```

---

## 5. Settings UI Recommended Implementation
In `src/pages/admin/Settings.jsx`, update the **Reservation Rules** card layout:

1. **State Initialization**:
   Add defaults for `bookingMode` and `maxCapacityPerHour` in the `settings` state:
   ```javascript
   const [settings, setSettings] = useState({
     // ... other fields
     bookingMode: 'enabled',
     maxCapacityPerHour: 30,
   });
   ```

2. **Fetch Mapping**:
   In `useEffect`'s `fetchData`:
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
   In `handleSave`:
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

4. **UI Structure (Reservation Configuration)**:
   Replace the checkboxes with:
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
