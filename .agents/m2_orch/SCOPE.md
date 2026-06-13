# Scope: Milestone 2 - Capacity & Booking Flow

## Objectives
1. Respect the three booking system modes:
   - If reservations are disabled: Show "Sorry, We are not taking Reservations Now!!" on the booking page and block entry.
   - If optional pre-ordering: After booking submission, display a prompt asking if they want to pre-order.
   - If mandatory pre-ordering: Submit details, save to localStorage (`pendingReservation`), and redirect immediately to the menu page (`/order`).
2. Implement unique alphanumeric Reservation ID generation:
   - Generate a 5-character random uppercase alphanumeric ID (e.g. "AK649") on request submission.
   - Use this ID as the Firestore document ID for the reservation.
   - Display this generated ID prominently on the booking confirmation screen.
   - In `Checkout.jsx`, modify the pre-order completion logic to use this custom ID (using `setDoc` instead of `addDoc` if the document does not exist yet) to ensure the ID carries through the lifecycle.
3. Implement hourly capacity limits checking:
   - Query Firestore for all `confirmed` reservations on the selected date.
   - For a given time slot, sum the guests of all confirmed reservations that overlap with that slot (i.e. start time is within less than 60 minutes of the slot, using a time parser).
   - A slot is over capacity if `confirmed_guests + requested_guests > maxCapacityPerHour`.
   - Disable/mark full time slots in the UI that exceed the capacity.
   - Perform the same check on submission in `handleSubmit` and block creation if exceeded with a clear message.

## Code Layout
- `src/pages/public/Book.jsx`
- `src/pages/public/Checkout.jsx`
