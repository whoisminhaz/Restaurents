# Handoff Report: Milestone 2 Capacity & Booking Flow Investigation

## 1. Observation
- **Code Locations & Existing Flow**:
  - `src/pages/public/Book.jsx`:
    - Early return for disabled booking (lines 244-257):
      ```javascript
      if (settings.bookingEnabled === false) { ... }
      ```
    - Check for pre-order requirement in `handleSubmit` (lines 150-155):
      ```javascript
      if (settings.requirePreOrderForBooking) {
        localStorage.setItem('pendingReservation', JSON.stringify(formData));
        navigate('/order');
        return;
      }
      ```
  - `src/pages/public/Checkout.jsx`:
    - Booking/Order linking at checkout (lines 119-146):
      ```javascript
      if (pendingRes.id) {
        await updateDoc(doc(db, 'reservations', pendingRes.id), {
          linkedOrderId: orderNumber
        });
      } else {
        await addDoc(collection(db, 'reservations'), { ... });
      }
      ```
  - `src/pages/admin/Settings.jsx`:
    - Settings doc structure containing `bookingMode`, `bookingEnabled`, `requirePreOrderForBooking`, and `maxCapacityPerHour` (lines 31-44, 53-62).
- **Test Infrastructure Issue**:
  - Executing `node tests/e2e/run-tests.js` failed with:
    `[PAGE LOG ERROR]: Failed to load resource: the server responded with a status of 404 ()` when navigating to `baseUrl + '/'`.
  - The entry HTML file is `app.html` (lines 1-13 of `app.html`), not `index.html`. Vite dev server defaults to `index.html` at `/`, resulting in 404.

## 2. Logic Chain
1. **Three Booking Modes**:
   - `bookingMode` is translated in `Settings.jsx` into `bookingEnabled` and `requirePreOrderForBooking`.
   - Mode `'disabled'` has `bookingEnabled = false`. Checking `settings.bookingEnabled === false` or `settings.bookingMode === 'disabled'` in `Book.jsx` and returning an early message blocks entry.
   - Mode `'preorder'` (mandatory) has `requirePreOrderForBooking = true`. Mode `'enabled'` (optional) has `requirePreOrderForBooking = false`.
   - Thus, separating these in `Book.jsx` and `Checkout.jsx` will satisfy the requirements.
2. **Reservation ID Generation**:
   - An alphanumeric generator (`generateReservationId`) producing a 5-character string (using uppercase alphabet and digits) provides $36^5 \approx 60.4M$ permutations.
   - Generating this ID inside `handleSubmit` in `Book.jsx` and setting it on the reservation document (using `setDoc` with the ID as the key) or inside `pendingReservation` in `localStorage` ensures it propagates to both database and checkout flows.
   - `Checkout.jsx` can check if the reservation exists in Firestore via `getDoc` and perform `setDoc` (if document does not exist yet) or `updateDoc` (if document already exists).
3. **Hourly Capacity Check**:
   - Confirmed reservations are retrieved by querying the `reservations` collection where `date` matches selected date and `status` is `'confirmed'`.
   - To check overlap of a candidate time slot $S$ and reservation time $R$, convert both to minutes from midnight. They overlap if $|S - R| < 60$ minutes.
   - Summing guest counts of all overlapping reservations and comparing against `settings.maxCapacityPerHour` determines if a slot is over capacity.
4. **E2E 404 Resolution**:
   - Since Vite dev server expects `index.html` by default, adding a dev server middleware rewrite in `vite.e2e.config.js` to map `/` to `/app.html` will fix the 404 error and let all Puppeteer tests run correctly.

## 3. Caveats
- Assumes `settings/master` document is initialized in Firestore (which is default behavior).
- Assumes the restaurant operates on 30-minute slot boundaries and reservations last exactly 1 hour.
- Assumes random 5-character IDs are sufficient without requiring sequential order.

## 4. Conclusion
We have mapped the full booking system flow and detailed a clean implementation strategy. Modifying `Book.jsx` and `Checkout.jsx` as planned will support all three booking modes, custom Reservation IDs, and hourly capacity checks. Resolving the Vite dev server routing issue will enable E2E tests to run successfully.

## 5. Verification Method
- **Verification Commands**:
  - Run the test suite: `node tests/e2e/run-tests.js`
- **Verification Files**:
  - Inspect `src/pages/public/Book.jsx` and `src/pages/public/Checkout.jsx` to verify exact implementation.
- **Invalidation Conditions**:
  - If E2E test runs still fail with 404.
  - If capacity limits do not prevent duplicate bookings on overlapping slots.

## Remaining Work
1. Add the html redirect plugin to `vite.e2e.config.js`.
2. Implement 5-character alphanumeric ID generation in `Book.jsx` and propagate it to `Checkout.jsx`.
3. Implement `parseTimeToMinutes` and hourly capacity logic in `Book.jsx`.
