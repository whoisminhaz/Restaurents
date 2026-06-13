# Handoff Report - Milestone 1 Analysis

This report is submitted by Explorer 1 to transition the codebase analysis findings for Milestone 1 to the Implementer.

## 1. Observation

- **Settings UI (`src/pages/admin/Settings.jsx`)**:
  - Fetches configuration from path `settings/master` in Firestore using `getDoc` at line 47:
    ```javascript
    const docRef = doc(db, 'settings', 'master');
    const docSnap = await getDoc(docRef);
    ```
  - Saves configuration using `setDoc` at line 244:
    ```javascript
    await setDoc(doc(db, 'settings', 'master'), settings);
    ```
  - Disables scheduling configuration conditionally when `settings.bookingEnabled === false` at lines 300, 315, 338, 365, etc.

- **Booking Flow (`src/pages/public/Book.jsx`)**:
  - Restricts customer access if booking is disabled (line 244):
    ```javascript
    if (settings.bookingEnabled === false) { ... }
    ```
  - Redirects to food ordering if pre-order is required (line 150):
    ```javascript
    if (settings.requirePreOrderForBooking) {
      localStorage.setItem('pendingReservation', JSON.stringify(formData));
      navigate('/order');
      return;
    }
    ```

- **Checkout Flow (`src/pages/public/Checkout.jsx`)**:
  - Updates the reservation's linked order during checkout (line 128):
    ```javascript
    await updateDoc(doc(db, 'reservations', pendingRes.id), {
      linkedOrderId: orderNumber
    });
    ```

- **Firestore Rules (`firestore.rules`)**:
  - Restricts all reservation reads/updates to authorized users at lines 33–36:
    ```javascript
    match /reservations/{document=**} {
      allow create: if true;
      allow read, update, delete: if isAuthorized();
    }
    ```

---

## 2. Logic Chain

1. **Settings Persistence**: Since `Settings.jsx` loads/saves the full settings state directly from/to `settings/master` in Firestore (Observation 1), introducing the `bookingMode` and `maxCapacityPerHour` fields requires adding them to the default state and form rendering structure.
2. **Backward Compatibility**: Since the public-facing booking flow (`Book.jsx`) relies on `settings.bookingEnabled` and `settings.requirePreOrderForBooking` (Observation 2), any updates to settings must continue to update these two boolean properties under the hood. Deriving these boolean values from the selected `bookingMode` (e.g. `'disabled'`, `'enabled'`, `'enabled_preorder'`) during state changes keeps existing booking flows intact.
3. **Capacity Type Casting**: Because standard HTML number inputs provide string representations in React's `onChange` event, saving without conversion stores numbers as strings in Firestore. To prevent type mismatches, `maxCapacityPerHour` must be parsed as a number (`Number(...)`) and validated to be `>= 0` during the saving process in `handleSave`.
4. **Checkout Rules Dependency**: Because the public checkout page (`Checkout.jsx`) executes an update to write the `linkedOrderId` back to a reservation document (Observation 3), a security rule that only allows public updates when `status == 'cancelled'` would cause the checkout to fail.
5. **Granular Write Allowances**: To fix the security rule mismatch without breaking public checkout, the security rules for updating reservations must explicitly allow public updates where the only modified key is either `status` (equal to `'cancelled'`) or `linkedOrderId` (Observation 3, Observation 4). All other modifications must require `isAuthorized()`.

---

## 3. Caveats

- **Firebase Local Emulator**: We assumed local testing of security rules will be performed via the Firebase Emulator. If an emulator is not set up, testing changes will require deploying directly to a test Firebase project database.
- **Validation Scope**: We assume `maxCapacityPerHour` is an integer count of guests. Floating point capacities are prevented by the UI using `type="number"`.

---

## 4. Conclusion

1. **Settings Page implementation**: Modify `Settings.jsx` to replace the two checkboxes with a `bookingMode` select input, and add a `maxCapacityPerHour` input. Update the initial state, the change handler validations, and sanitize the object inside `handleSave` to convert capacity to a number and populate `bookingMode` for compatibility.
2. **Firestore rules implementation**: Update `firestore.rules` for the `reservations` path to allow unauthenticated read, and unauthenticated updates specifically for `status` (to `'cancelled'`) and `linkedOrderId` only.

---

## 5. Verification Method

- **Build Check**: Execute `npm run build` in the workspace root. Confirm that it transpiles successfully without errors or warnings.
- **Rule Deployment / Simulation**: Run `firebase deploy --only firestore:rules` to deploy. Test updates:
  - Simulate a public update matching `{ status: 'cancelled' }` using Firebase Rules Simulator or client SDK. It should succeed.
  - Simulate a public update matching `{ linkedOrderId: 'someOrder123' }`. It should succeed.
  - Simulate a public update trying to modify the customer name or date. It should fail.
- **UI Interaction**: In the browser, navigate to settings, try inputting `-5` as capacity, save, and verify it is rejected. Verify that saving `25` saves it as a number in Firestore. Changing booking mode to "Disabled" should block public booking on `/book`.
