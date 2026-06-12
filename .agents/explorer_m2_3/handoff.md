# Handoff Report: Milestone 2 - Capacity & Booking Flow

## 1. Observation
- In `src/pages/public/Book.jsx` lines 244–257, booking closure blocks entry but displays `"Reservations Closed"` rather than the exact required string `"Sorry, We are not taking Reservations Now!!"`.
- In `src/pages/public/Book.jsx` line 159, the reservation is created via `addDoc` (auto-generating the Firestore document ID) and in line 150, redirects to `/order` (saving the form to `localStorage` under `'pendingReservation'`) without a generated ID.
- In `src/pages/public/Checkout.jsx` lines 121–146, the pre-order completion checks for `pendingRes.id` and updates it, or calls `addDoc` if it doesn't exist, which fails to propagate any custom ID in the mandatory pre-order flow.
- Capacity is defined in settings under `maxCapacityPerHour` (loaded in `Book.jsx` line 50 from `settings/master` document), but currently no hourly limit checks or time parsing/overlap logic exists.

---

## 2. Logic Chain
1. **Disabled Mode**: Update `Book.jsx` check (`settings.bookingEnabled === false`) to render the exact text `"Sorry, We are not taking Reservations Now!!"`.
2. **Alphanumeric ID Generation**:
   - Generate a 5-character uppercase alphanumeric ID using a random string generator in `Book.jsx`.
   - Store it as `id` inside `'pendingReservation'` in `localStorage` for mandatory pre-ordering.
   - For optional/no pre-ordering, use `setDoc` with the generated ID as the document key.
   - In `Checkout.jsx`'s `handleSubmit`, read the `id`. Use `getDoc` to determine if the reservation document already exists. If not, use `setDoc` to create it with the custom ID.
3. **Capacity Constraints**:
   - Query all `'confirmed'` status reservations on the selected date.
   - Parse times (like `'10:00 AM'`) to minutes from midnight. An overlap occurs when the absolute difference in minutes between the selected slot and a confirmed reservation is `< 60`.
   - Disable slots in the UI and block submissions in `handleSubmit` if `confirmed_guests + requested_guests > maxCapacityPerHour`.

---

## 3. Caveats
- If the owner updates `maxCapacityPerHour` while a customer is booking, the new capacity takes effect on the next reload or state fetch.
- If a reservation is pending, it does not count towards the capacity limit. Only `'confirmed'` reservations count.
- In mandatory pre-ordering, a final validation in `Checkout.jsx` prior to writing the order and reservation could be added to mitigate slot saturation between booking page submission and checkout completion.

---

## 4. Conclusion
The codebase is ready for implementing Milestone 2 using the proposed strategy. No structural refactoring is needed; we can implement ID generation, capacity limit checks, and checkout lifecycle sync using standard Firestore queries and React hooks.

---

## 5. Verification Method
- **UI Capacity Disable**: Set capacity to a low number (e.g. 5) in Settings, create a confirmed reservation of 4 guests at 12:00 PM, and verify that 12:00 PM and 12:30 PM slots are disabled in UI for a booking of 2 guests.
- **Race Condition Prevention**: Test submission checking in `Book.jsx`'s `handleSubmit` to verify it query-checks fresh Firestore data.
- **Alphanumeric ID Tracking**: Verify that reservation documents in the Firestore console use the custom 5-character ID (e.g., `'AK649'`) and display correctly on both `Book.jsx` and `Checkout.jsx` confirmation receipts.
