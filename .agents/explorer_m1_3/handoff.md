# Handoff Report - Explorer 3

## 1. Observation
The following file paths, lines, and configurations were observed during the investigation:

* **Firestore Security Rules (`firestore.rules`):**
  * Lines 33-36:
    ```javascript
    match /reservations/{document=**} {
      allow create: if true;
      allow read, update, delete: if isAuthorized();
    }
    ```
    This restricts all reads and updates to admin accounts, causing a permissions mismatch when public users attempt to search or cancel reservations.

* **Settings Schema and UI (`src/pages/admin/Settings.jsx`):**
  * Lines 47-50 (loading settings from `settings/master`):
    ```javascript
    const docRef = doc(db, 'settings', 'master');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSettings(prev => ({ ...prev, ...docSnap.data() }));
    }
    ```
  * Lines 287-312: The UI currently uses two checkboxes for `bookingEnabled` and `requirePreOrderForBooking`.

* **Reservation Creation (`src/pages/public/Book.jsx` & `src/pages/public/Checkout.jsx`):**
  * Lines 159-163 (in `Book.jsx`):
    ```javascript
    const docRef = await addDoc(collection(db, 'reservations'), {
      ...formData,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    ```
  * Lines 133-138 (in `Checkout.jsx`):
    ```javascript
    await addDoc(collection(db, 'reservations'), {
      ...pendingRes,
      linkedOrderId: orderNumber,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    ```

* **Reservation Read & Cancel Flow (`src/pages/public/Book.jsx`):**
  * Lines 181-193:
    ```javascript
    const resDoc = await getDoc(doc(db, 'reservations', searchVal));
    if (resDoc.exists()) {
      const data = resDoc.data();
      if (data.status === 'confirmed') { ... }
    }
    // ...
    const q = query(collection(db, 'reservations'), where('phone', '==', searchVal), where('status', '==', 'confirmed'));
    ```
  * Lines 214-216:
    ```javascript
    await updateDoc(doc(db, 'reservations', foundRes.id), {
      status: 'cancelled'
    });
    ```
  * Lines 128-130 (in `Checkout.jsx`):
    ```javascript
    await updateDoc(doc(db, 'reservations', pendingRes.id), {
      linkedOrderId: orderNumber
    });
    ```

---

## 2. Logic Chain
1. **Rule Restrictions**: Current rules require `isAuthorized()` for `read` and `update` on `reservations` (Observation 1).
2. **Public Operations**: Public users must perform `getDoc` and `getDocs` when querying a reservation, and `updateDoc` when cancelling it or linking an order (Observation 4).
3. **Mismatches**: This creates a runtime error for public users during search, cancel, and checkout flows.
4. **Information Leakage Risk**: Allowing public `list` queries permits unauthorized listing of the entire `reservations` collection, exposing customer PII.
5. **Security Solution**: Restricting public read to `get` (single document) keeps data secure under high-entropy Firestore auto-generated IDs. Consequently, phone number search (which requires `list` query) must be disabled or deprecated in the frontend in favor of ID-only search.
6. **Granular Update Control**: Public updates must be restricted to prevent tampering. By verifying that only `'status'` (changed to `'cancelled'`) or `'linkedOrderId'` (if empty) are modified, we avoid arbitrary updates.
7. **Settings Compatibility**: `bookingMode` and `maxCapacityPerHour` should map back to the legacy boolean fields `bookingEnabled` and `requirePreOrderForBooking` during saving (Observation 2) to prevent breaking existing checks in `Book.jsx` and `Checkout.jsx`.

---

## 3. Caveats
* **Query by Phone**: Restricting `list` to admin will cause the query-by-phone feature in `Book.jsx` (Manage Booking tab) to return `Permission Denied`. The front-end must search using the Reservation ID. If phone search is required, the rules must allow public `list`, which exposes customer PII.
* **Auto-generated IDs**: Security relies on reservation IDs being cryptographically secure, random, and unguessable.

---

## 4. Conclusion
* **Rules Update**: Modify `firestore.rules` to permit public `get` but restrict `list` to admins. Add update constraints using `diff()` to restrict modifications to `status` and `linkedOrderId`.
* **Settings Update**: Update `Settings.jsx` to load, display, and save `bookingMode` and `maxCapacityPerHour` with mapped legacy booleans for compatibility.

---

## 5. Verification Method
* Deploy the updated security rules to a Firebase Emulator.
* Execute the following test cases:
  1. Create reservation as public user $\rightarrow$ **Success**
  2. Read single reservation by ID as public user $\rightarrow$ **Success**
  3. Query reservations by phone as public user $\rightarrow$ **Error (Permission Denied)**
  4. Query list of all reservations as public user $\rightarrow$ **Error (Permission Denied)**
  5. Update status to `'cancelled'` as public user $\rightarrow$ **Success**
  6. Update name, date, or other details as public user $\rightarrow$ **Error (Permission Denied)**
  7. Verify `Settings.jsx` loads and saves `bookingMode` and `maxCapacityPerHour` correctly mapping to the legacy flags.
