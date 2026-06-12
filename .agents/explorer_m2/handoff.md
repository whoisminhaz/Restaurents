# Handoff Report

## 1. Observation
We observed the following code sections in the repository:
- **Settings Fetching in Book.jsx (Lines 50-52)**:
  ```javascript
  const snap = await getDoc(doc(db, 'settings', 'master'));
  if (snap.exists()) {
    setSettings(snap.data());
  ```
- **Booking Block in Book.jsx (Lines 244-248)**:
  ```javascript
  if (settings.bookingEnabled === false) {
    return (
      <div className="min-h-screen bg-[#faf7f2] ... text-center ...">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reservations Closed</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Sorry, we are not taking orders or reservations right now.</p>
  ```
- **Optional vs Mandatory Route in Book.jsx (Lines 150-155)**:
  ```javascript
  if (settings.requirePreOrderForBooking) {
    // Save pending reservation to local storage and go to order page
    localStorage.setItem('pendingReservation', JSON.stringify(formData));
    navigate('/order');
    return;
  }
  ```
- **Reservation ID and Insertion in Book.jsx (Lines 159-165)**:
  ```javascript
  const docRef = await addDoc(collection(db, 'reservations'), {
    ...formData,
    status: 'pending',
    timestamp: serverTimestamp()
  });
  setCreatedResId(docRef.id);
  setSuccess(true);
  ```
- **Checkout Reservation Logic in Checkout.jsx (Lines 125-139)**:
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

---

## 2. Logic Chain
- **Booking Mode Conversion**: To support `bookingMode` from `settings/master` instead of `bookingEnabled` and `requirePreOrderForBooking`, we replace checks in `Book.jsx`:
  - `bookingMode === 'disabled'` blocks entry and displays `"Sorry, We are not taking Reservations Now!!"`.
  - `bookingMode === 'enabled-mandatory-preorder'` triggers the mandatory pre-order flow.
  - `bookingMode === 'enabled-no-preorder'` triggers the optional pre-order flow.
- **Reservation ID Generation**: Submitting the booking generates a 5-character alphanumeric uppercase ID. If the pre-ordering is mandatory, this ID is saved under `pendingReservation` in `localStorage` without writing to Firestore. If optional, the reservation is immediately written to Firestore under this ID using `setDoc`.
- **Checkout Routing Reconciliation**: In `Checkout.jsx`, instead of checking for `pendingRes.id` presence (which is now always present because we generate the ID in `Book.jsx`), we check if the document exists in Firestore using `getDoc`. If it does (optional flow), we call `updateDoc` to link the order. If it does not (mandatory flow), we use `setDoc` with the generated ID to create the reservation document.
- **Capacity Constraint**: A slot overlaps with confirmed bookings if the difference in their start times is less than 60 minutes. Checking overlap is implemented using a 12-hour format parser `timeToMinutes`. Summing guest counts of overlapping bookings on the selected date determines if the current capacity (`maxCapacityPerHour`) is exceeded. If so, slots are disabled in the UI and blocked/re-verified on submission.

---

## 3. Caveats
- **Alphanumeric ID uniqueness**: The generator does not explicitly poll Firestore to guarantee uniqueness before insertion, though the probability of collision for a 5-character base-36 string ($60.4\text{ million}$ combinations) is extremely low.
- **Time Format**: The time parser assumes the slots and reservations are consistently stored in 12-hour AM/PM format (e.g. `'06:30 PM'`).
- **Database Status**: The capacity calculations only fetch reservations with `status === 'confirmed'`. Any pending, completed, or cancelled reservations are ignored.

---

## 4. Conclusion
We have mapped the entire flow and prepared a self-contained implementation plan in `analysis.md` to cleanly integrate capacity checking, dynamic slot disabling, `bookingMode` switching, and custom 5-character ID reservations.

---

## 5. Verification Method
- **Inspect Target Files**: Review `src/pages/public/Book.jsx` and `src/pages/public/Checkout.jsx` to verify targeted lines and variables match the changes described in `analysis.md`.
- **Run Build/Tests**: The project does not contain explicit automated test suites (e.g. `npm test` is not configured or not requested). Verification can be done by inspecting the detailed proposals in `analysis.md`.
