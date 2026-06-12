# Synthesis - Milestone 2

## Consensus
- **Booking Modes**:
  - Disabled: Show `"Sorry, We are not taking Reservations Now!!"` and block entry.
  - Optional pre-order: Create reservation first, display CTA redirecting to `/order`.
  - Mandatory pre-order: Save to `localStorage` with generated ID, redirect to `/order`.
- **ID Generation**:
  - Alphanumeric, 5 uppercase characters (e.g. `AK649`).
  - Use `setDoc` with the generated ID as the Firestore document path (not auto-generated ID).
  - In `Checkout.jsx`, use `getDoc` to check if reservation exists under the custom ID: if yes, update it; if no, create it with `setDoc`.
- **Capacity Limits**:
  - Query Firestore for `'confirmed'` reservations on the selected date.
  - Overlap is defined as absolute difference of start times < 60 minutes.
  - Display slots exceeding limit as disabled and label with `(Full)`.
  - Re-verify capacity on submit in `handleSubmit` and block creation if exceeded.

## Key Files
- `src/pages/public/Book.jsx`
- `src/pages/public/Checkout.jsx`
