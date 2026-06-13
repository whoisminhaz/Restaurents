# Handoff Report - explorer_m2_1

## 1. Observation
- **`src/pages/public/Book.jsx`**:
  - Handles the reservation requesting flow.
  - Line 2: Imports firestore operations:
    ```javascript
    import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
    ```
  - Lines 48–62: Loads the settings from Firestore `settings/master` document:
    ```javascript
    const snap = await getDoc(doc(db, 'settings', 'master'));
    ```
  - Lines 146–172: Handles booking form submission:
    ```javascript
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.time) return alert("Please select a valid time.");

      if (settings.requirePreOrderForBooking) {
        // Save pending reservation to local storage and go to order page
        localStorage.setItem('pendingReservation', JSON.stringify(formData));
        navigate('/order');
        return;
      }
      ...
    ```
  - Lines 244–257: Displays a general "Reservations Closed" screen if `settings.bookingEnabled === false`.
  
- **`src/pages/public/Checkout.jsx`**:
  - Handles the cart checkout and pre-order completion logic.
  - Lines 126–140: Performs the reservation update or creation during checkout:
    ```javascript
    if (pendingRes.id) {
      // Reservation was already created in Book.jsx (optional pre-order flow)
      await updateDoc(doc(db, 'reservations', pendingRes.id), {
        linkedOrderId: orderNumber
      });
    } else {
      // Reservation was NOT created yet (required pre-order flow)
      await addDoc(collection(db, 'reservations'), {
        ...pendingRes,
        linkedOrderId: orderNumber,
        status: 'pending',
        timestamp: serverTimestamp()
      });
    }
    ```

- **`src/pages/admin/Settings.jsx`**:
  - Shows that `bookingMode` is stored in the `settings/master` document and maps to `bookingEnabled` and `requirePreOrderForBooking` properties (Lines 100–122).
  - Shows `maxCapacityPerHour` is retrieved from the settings (Lines 63–74) with a default value of 30.

---

## 2. Logic Chain
1. **Booking Modes**: In `Book.jsx`, checking `settings.bookingMode` or `settings.bookingEnabled` / `settings.requirePreOrderForBooking` properties directly maps the system state to the three specified modes (Disabled, Optional Pre-Order, and Mandatory Pre-Order).
2. **Custom ID Generation**: Generating a 5-character alphanumeric ID on booking submission in `Book.jsx` allows using this ID as the Firestore document key via `setDoc`. Since it is stored in `localStorage` under `pendingReservation` for the pre-order flow, it carries through the entire checkout lifecycle in `Checkout.jsx`.
3. **Capacity Check Overlap**: Converting 12-hour AM/PM strings (e.g. `"10:30 AM"`) to minutes from midnight makes it trivial to calculate time differences. An overlap exists when `Math.abs(selectedMinutes - reservationMinutes) < 60`.
4. **Interactive UI**: Querying confirmed reservations on the selected date when the date field changes in `Book.jsx` lets the UI dynamically mark full/disabled slots in the dropdown based on selected guest counts. Re-running this check on submission avoids race conditions.

---

## 3. Caveats
- Checked and verified that no custom validation hooks or styling constraints conflict with this change.
- Assumed standard time formats (e.g., `"10:00 AM"`) are stored in Firestore, generated via the existing time slot generator. If the date or time formats change on the admin side, the time parser would need to be updated.
- We assume that `settings.maxCapacityPerHour` is always non-negative.

---

## 4. Conclusion
The proposed updates are fully detailed in `analysis.md`. They are non-disruptive, maintain structural layouts, and cleanly integrate capacity limit controls, custom IDs, and system modes into the existing pages without writing new global styles or libraries.

---

## 5. Verification Method
- **UI Testing**: Check that slots are properly disabled/marked `(Full)` or show the available capacity when selecting dates and changing guest quantities.
- **Firestore Verification**: Inspect the `reservations` collection to confirm new reservations are saved with the 5-character custom ID as the document ID.
- **Mode Testing**: Test each booking mode separately (Disabled, Optional, Mandatory) and verify correct redirection and prompts.
- **Race Condition Prevention**: Emulate overlapping submissions to confirm the validation blocks creation with an alert.
