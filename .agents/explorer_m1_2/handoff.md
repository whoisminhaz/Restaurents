# Handoff Report - Explorer 2

## 1. Observation
We observed the following code sections and behaviors:

* **Firestore Security Rules (`firestore.rules`):**
  * Lines 11-16 (Dynamic Role Check):
    ```javascript
    function isAuthorized() {
      return isSuperAdmin() || 
             (request.auth != null && 
              exists(/databases/$(database)/documents/settings/adminConfig) &&
              request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails);
    }
    ```
    This function verifies authorization for writes to settings, menu, orders, and reservations, but does not check the `ownerEmail` field.
  * Lines 33-36:
    ```javascript
    match /reservations/{document=**} {
      allow create: if true;
      allow read, update, delete: if isAuthorized();
    }
    ```

* **Frontend Auth and Settings UI (`src/pages/admin/Settings.jsx`):**
  * Lines 53-57 (loading allowed/owner emails):
    ```javascript
    const adminDocRef = doc(db, 'settings', 'adminConfig');
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      if (adminSnap.data().allowedEmails) setEmployeeEmails(adminSnap.data().allowedEmails);
      if (adminSnap.data().ownerEmail) setOwnerEmail(adminSnap.data().ownerEmail);
    }
    ```
  * Lines 290-312: Reservation Configuration UI uses two checkbox inputs for `bookingEnabled` and `requirePreOrderForBooking`.

* **Frontend Owner Validation (`src/pages/admin/Login.jsx` & `src/components/DashboardLayout.jsx`):**
  * In `Login.jsx` (lines 29-30):
    ```javascript
    if (adminData.ownerEmail === userEmail) authorized = true;
    if (adminData.allowedEmails && adminData.allowedEmails.includes(userEmail)) authorized = true;
    ```
  * In `DashboardLayout.jsx` (lines 55-58):
    ```javascript
    const isOwner = userEmail === adminData.ownerEmail;
    if (isSuper || isOwner) {
      setIsAdmin(true);
    }
    ```

* **Reservation Flow Updates (`src/pages/public/Checkout.jsx`):**
  * Line 128:
    ```javascript
    await updateDoc(doc(db, 'reservations', pendingRes.id), {
      linkedOrderId: orderNumber
    });
    ```
    This shows the client updates `linkedOrderId` during public checkout.

---

## 2. Logic Chain
1. **Frontend-Backend Authorization Disconnect**:
   - Observation: `Login.jsx` and `DashboardLayout.jsx` authorize the owner on the frontend using `adminConfig.ownerEmail`.
   - Observation: `firestore.rules`'s `isAuthorized()` only checks `allowedEmails`.
   - Inference: A logged-in owner who is not explicitly listed in the `allowedEmails` array will experience `Permission Denied` errors on any database write operations.
   - Conclusion: `isAuthorized()` must check both `allowedEmails` and `ownerEmail`.

2. **Public Update Rules Conflict**:
   - Request: Public updates on reservations must be strictly restricted to changing the `status` to `'cancelled'`.
   - Observation: `Checkout.jsx` performs an unauthenticated `updateDoc` to set `linkedOrderId` after customer checkout.
   - Inference: Strictly blocking all updates except status change will cause the optional pre-order checkout flow to fail when updating the reservation.
   - Conclusion: The rules must support both cases or explicitly choose between Path A (strict compliance) and Path B (retaining functionality for `linkedOrderId` updates).

3. **Legacy UI Compatibility**:
   - Observation: `Book.jsx` relies on `settings.bookingEnabled` and `settings.requirePreOrderForBooking`.
   - Inference: Replacing these with `bookingMode` dropdown in Settings UI requires mapping functions during loading and saving to prevent breaking client-side logic.

---

## 3. Caveats
* **Querying by Phone PII Leakage**: If `list` queries are permitted for public users, it exposes all reservations. Restricting it to `get` (ID-only) means the customer search by phone in `Book.jsx` will fail with permission errors. The recommended strategy enforces ID-only search for public users.
* **Auto-generated IDs**: Security of public reads depends on Firestore document IDs being secure, high-entropy, random strings.

---

## 4. Conclusion
* **Rules Update**: Modify `isAuthorized()` to verify both `ownerEmail` and `allowedEmails`. Split `read` into `get: if true` and `list: if isAuthorized()`. Constrain `update` to allow status cancellation and/or `linkedOrderId` changes.
* **Settings UI Update**: Implement `bookingMode` (dropdown) and `maxCapacityPerHour` (number input) in `Settings.jsx`, mapping them to legacy fields upon saving to maintain backward compatibility.

---

## 5. Verification Method
* Set up a local Firestore Emulator.
* Inspect `firestore.rules` and `Settings.jsx` after edits.
* Run the following tests:
  1. Retrieve a single reservation using its ID as an unauthenticated client -> **Success**
  2. Scan or list the `reservations` collection as an unauthenticated client -> **Permission Denied**
  3. Cancel reservation (update status to `'cancelled'`) as an unauthenticated client -> **Success**
  4. Edit other fields (such as name or guests) as an unauthenticated client -> **Permission Denied**
  5. Save settings with owner email and check backend write access.
