# Scope: Milestone 1 - Settings and Rules Updates

## Objectives
1. Update UI and functionality in `src/pages/admin/Settings.jsx` to load, display, and save:
   - `maxCapacityPerHour` (Maximum capacity per hour) as a number setting.
   - `bookingMode` (booking system mode) as a toggle/dropdown with three options:
     - Disabled
     - Enabled without mandatory pre-ordering
     - Enabled with mandatory pre-ordering
2. Update Firestore Security Rules (`firestore.rules`) to fix the permissions mismatch:
   - Allow unauthenticated (public) read and update (specifically updating status to 'cancelled') operations on the `reservations` collection.
   - Restrict other operations (like deleting or general updates) to authorized admin/employee emails.

## Code Layout
- `src/pages/admin/Settings.jsx`
- `firestore.rules`
