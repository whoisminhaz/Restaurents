# Milestone 1 Codebase Analysis: Settings UI and Firestore Security Rules

## 1. Executive Summary

This report analyzes the codebase for Milestone 1, focusing on Settings UI updates in `src/pages/admin/Settings.jsx` and Firestore Security Rules in `firestore.rules`. 

- **Settings UI**: The reservation settings are stored at Firestore path `settings/master`. We propose replacing the two separate checkboxes in "Reservation Rules" with a unified `bookingMode` dropdown and a validated `maxCapacityPerHour` number input. To maintain backward compatibility with the customer-facing `Book.jsx` page, the settings document will persist the derived `bookingEnabled` (boolean) and `requirePreOrderForBooking` (boolean) fields alongside the new `bookingMode` (string) field.
- **Firestore Security Rules**: A critical dependency mismatch was discovered. The customer-facing checkout (`Checkout.jsx`) updates the `reservations` collection to link `linkedOrderId` upon successful order completion. Limiting the public update rule solely to `status == 'cancelled'` would break checkout for reservations. We propose a security rule that allows unauthenticated updates specifically for either `status == 'cancelled'` or `linkedOrderId` fields while restricting all other updates to authorized users.

---

## 2. Settings UI Analysis (`src/pages/admin/Settings.jsx`)

### 2.1 Firestore Paths & Persisted State
- **Document Path**: `settings/master` stores general restaurant configurations.
- **State Management**:
  - React state `settings` is initialized with default properties (e.g., `restaurantName`, `themePrimary`, `languages`, `discountPercent`, `taxPercent`, etc.).
  - `useEffect` (lines 44–72) fetches the document using `getDoc(doc(db, 'settings', 'master'))` and sets the state:
    ```javascript
    setSettings(prev => ({ ...prev, ...docSnap.data() }));
    ```
- **Form Handlers**:
  - `handleChange` manages standard input fields:
    ```javascript
    const handleChange = (e) => {
      const { name, value } = e.target;
      setSettings(prev => ({ ...prev, [name]: value }));
    };
    ```
  - `handleSave` saves the complete `settings` object back to Firestore (lines 241–253):
    ```javascript
    await setDoc(doc(db, 'settings', 'master'), settings);
    ```

### 2.2 Integration Strategy for `bookingMode`
`Book.jsx` reads `settings.bookingEnabled` and `settings.requirePreOrderForBooking` directly. To avoid modifying the public booking flow, we will:
1. Map the new UI select element value to a temporary state/derived value for `bookingMode`:
   - `disabled`: `bookingEnabled === false`
   - `enabled`: `bookingEnabled !== false && !requirePreOrderForBooking`
   - `enabled_preorder`: `bookingEnabled !== false && requirePreOrderForBooking`
2. Update all three fields (`bookingMode`, `bookingEnabled`, and `requirePreOrderForBooking`) when the dropdown changes.
3. In `handleSave`, write the updated state fields to Firestore.

### 2.3 Integration Strategy for `maxCapacityPerHour`
1. Add `maxCapacityPerHour` to the initial settings state (default: `0` or `30`).
2. Add a number input field in `Settings.jsx` with `min="0"`.
3. Validate that `maxCapacityPerHour` is a number and is `>= 0` in `handleSave` before calling `setDoc`. Show an alert and abort if validation fails.
4. Coerce the value to a number (`Number(settings.maxCapacityPerHour)`) in `handleSave` to ensure it is stored as a Firestore Number rather than a String.

---

## 3. Firestore Security Rules Analysis (`firestore.rules`)

### 3.1 Security Mismatch & Critical Discovery
The scope document states:
> *Allow unauthenticated (public) read and update (specifically updating status to 'cancelled') operations on the `reservations` collection.*

During our codebase search, we traced all writes to `/reservations`:
1. `src/pages/public/Book.jsx` (unauthenticated):
   - Creates a pending reservation using `addDoc(collection(db, 'reservations'), ...)`.
   - Cancels a reservation using:
     ```javascript
     await updateDoc(doc(db, 'reservations', foundRes.id), { status: 'cancelled' });
     ```
2. `src/pages/public/Checkout.jsx` (unauthenticated):
   - Updates an existing reservation to link an order during checkout:
     ```javascript
     await updateDoc(doc(db, 'reservations', pendingRes.id), { linkedOrderId: orderNumber });
     ```
3. `src/pages/admin/Reservations.jsx` (authenticated admin/staff):
   - Performs general updates (e.g. status changes, date modifications) and deletes.

If we restrict public update operations exclusively to `status == 'cancelled'`, the customer checkout flow (`Checkout.jsx`) will fail with a permission error.

### 3.2 Proposed Security Rules Solution
To safely support customer checkout, customer cancellations, and keep other operations admin-only, the `/reservations` rules should:
- Allow unauthenticated `create` (anyone can request a booking).
- Allow unauthenticated `read` (anyone can retrieve their booking using their phone/ID).
- Allow unauthenticated `update` only if:
  - The updated document status is being set to `'cancelled'` and only the `status` field is modified, **OR**
  - Only the `linkedOrderId` field is modified.
- Restrict all other updates and deletes to authorized admin/staff (`isAuthorized()`).

---

## 4. Proposed Implementation Specifications

### 4.1 Changes to `src/pages/admin/Settings.jsx`

#### Initial State Definition (approx line 31)
```javascript
  const [settings, setSettings] = useState({
    restaurantName: 'Cafe Bella',
    themePrimary: '#b5602a',
    languages: ['en'],
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    tngQrCode: '',
    discountPercent: 0,
    discountItems: ['all'],
    taxPercent: 0,
    // Add new fields with safe defaults
    maxCapacityPerHour: 30,
    bookingMode: 'enabled'
  });
```

#### Settings Save Handler (approx line 241)
```javascript
  const handleSave = async () => {
    // 1. Validation for maxCapacityPerHour
    if (settings.bookingEnabled !== false) {
      const cap = Number(settings.maxCapacityPerHour);
      if (isNaN(cap) || cap < 0) {
        alert("Maximum capacity per hour must be a number greater than or equal to 0.");
        return;
      }
    }

    setSaving(true);
    try {
      // 2. Sanitize settings object before saving
      const updatedSettings = {
        ...settings,
        maxCapacityPerHour: settings.maxCapacityPerHour !== undefined && settings.maxCapacityPerHour !== '' 
          ? Number(settings.maxCapacityPerHour) 
          : 0,
        bookingMode: settings.bookingMode || (settings.bookingEnabled === false ? 'disabled' : (settings.requirePreOrderForBooking ? 'enabled_preorder' : 'enabled'))
      };

      await setDoc(doc(db, 'settings', 'master'), updatedSettings);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Check permissions.");
    } finally {
      setSaving(false);
    }
  };
```

#### UI Fields Replacement (approx line 286-313)
Replace the existing checkbox widgets under "Reservation Rules" with the select dropdown and capacity input:

```javascript
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Booking System Mode</label>
                <select
                  name="bookingMode"
                  value={settings.bookingMode || (settings.bookingEnabled === false ? 'disabled' : (settings.requirePreOrderForBooking ? 'enabled_preorder' : 'enabled'))}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setSettings(prev => ({
                      ...prev,
                      bookingMode: mode,
                      bookingEnabled: mode !== 'disabled',
                      requirePreOrderForBooking: mode === 'enabled_preorder'
                    }));
                  }}
                  className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled without mandatory pre-ordering</option>
                  <option value="enabled_preorder">Enabled with mandatory pre-ordering</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Configure whether customers can make reservations and if pre-ordering food is required.
                </p>
              </div>

              <div className={settings.bookingEnabled === false ? 'opacity-50 pointer-events-none' : ''}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Capacity Per Hour</label>
                <input
                  type="number"
                  name="maxCapacityPerHour"
                  min="0"
                  value={settings.maxCapacityPerHour !== undefined ? settings.maxCapacityPerHour : ''}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Limit the total number of guests allowed to book in a single hour slot. Must be 0 or greater.
                </p>
              </div>
            </div>
```

---

### 4.2 Changes to `firestore.rules`

Modify the match block for `reservations`:

```javascript
    match /reservations/{document=**} {
      allow create: if true;
      allow read: if true;
      allow update: if isAuthorized() || 
                    (request.resource.data.status == 'cancelled' && 
                     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])) ||
                    (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']));
      allow delete: if isAuthorized();
    }
```

---

## 5. Verification Strategy

### 5.1 Settings Page Verification
1. **Capacity Validation**:
   - Navigate to Settings. Set "Maximum Capacity Per Hour" to a negative number (e.g. `-5`). Click Save. Verify that a validation alert is displayed, and the document is not saved to Firestore.
   - Set the value to `0` or a positive integer (e.g. `25`). Click Save. Reload settings, check that it loads as the correct number type.
2. **Booking Mode Toggle**:
   - Change "Booking System Mode" to "Disabled". Verify that the dependent fields (e.g. Operating Hours, Capacity, Holiday/Closed dates) become visually disabled/faded. Click Save.
   - Navigate to `/book` as a public customer. Confirm that the system displays "Reservations Closed".
   - Set "Booking System Mode" to "Enabled with mandatory pre-ordering". Click Save.
   - Navigate to `/book`, fill in a request, and verify that clicking the submit button redirects to the Menu for pre-ordering.

### 5.2 Security Rules Verification
1. **Rule Compilation**:
   - Deploy/validate rules locally with the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```
2. **Public Update Restrictions**:
   - Simulate a public client updating a reservation document:
     - Changing `status` to `'cancelled'` -> Should succeed.
     - Changing `linkedOrderId` to a new ID -> Should succeed.
     - Attempting to update `name`, `date`, or `guests` as a public client -> Should fail with permission denied.
     - Attempting to delete a reservation as a public client -> Should fail with permission denied.
3. **Admin Privileges**:
   - Logged-in admin/employee (e.g., matching emails in `settings/adminConfig` or owner email) should be able to update any fields on reservations, and delete reservations successfully.
