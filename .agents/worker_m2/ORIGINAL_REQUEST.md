## 2026-06-12T10:47:36Z
You are teamwork_preview_worker. Your working directory is f:\All restaurents\master-restaurant-template\.agents\worker_m2.
MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task: Implement the Capacity & Booking Flow requirements (Milestone 2):
1. In `src/pages/public/Book.jsx`:
   - Fetch settings from `settings/master` and read `bookingMode`.
   - If `bookingMode` is `'disabled'`, display "Sorry, We are not taking Reservations Now!!" and block entry.
   - When submitting a reservation, generate a random 5-character uppercase alphanumeric ID (e.g., "AK649").
   - Use this custom ID as the Firestore document ID under `reservations` collection (using `setDoc(doc(db, 'reservations', customId), ...)`).
   - Display this reservation ID prominently on the confirmation success screen.
   - Respect modes: If `'enabled-mandatory-preorder'`, save to localStorage (`pendingReservation` with `id: customId`) and redirect to `/order`. If `'enabled-no-preorder'`, create reservation immediately in Firestore as `pending`, and display the optional pre-order prompt.
   - Load all `confirmed` reservations on the selected date. Disable time slots in the UI that exceed `maxCapacityPerHour` (default 30) by calculating overlapping bookings (reservations within 60 minutes of the slot time).
   - Re-verify capacity inside `handleSubmit` against Firestore data and abort booking if it would exceed.
2. In `src/pages/public/Checkout.jsx`:
   - Update the pre-order completion block. If a `pendingReservation` exists with an `id`, write the reservation to Firestore using `setDoc` (if the document does not exist yet) or `updateDoc` (if it does exist) using the custom ID.
   - Display the reservation ID prominently on the checkout success screen.
3. Test that the project builds cleanly with `npm run build`.
4. Write your handoff and results to `f:\All restaurents\master-restaurant-template\.agents\worker_m2\handoff.md`.
When done, report back to the orchestrator (conversation ID: 12e2cf5d-474d-48aa-a181-5d135852ee70).
