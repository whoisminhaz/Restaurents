## 2026-06-12T10:31:16Z
You are Worker 1 (archetype teamwork_preview_worker).
Your working directory is: f:\All restaurents\master-restaurant-template\.agents\worker_m1
Your task is to implement the Settings UI updates and Firestore Security Rules updates for Milestone 1.

Scope Document: f:\All restaurents\master-restaurant-template\.agents\m1_orch\SCOPE.md

Please perform the following changes:

1. Update `firestore.rules`:
   - Update `isAuthorized()` to allow access to both owners (`ownerEmail`) and authorized employee emails (`allowedEmails`):
     ```javascript
     function isAuthorized() {
       return isSuperAdmin() || 
              (request.auth != null && 
               exists(/databases/$(database)/documents/settings/adminConfig) &&
               (request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails ||
                ('ownerEmail' in get(/databases/$(database)/documents/settings/adminConfig).data &&
                 request.auth.token.email == get(/databases/$(database)/documents/settings/adminConfig).data.ownerEmail)));
     }
     ```
   - Update `/reservations/{reservationId}` rules:
     - Allow public `create` and `get` operations (`allow create, get: if true;`).
     - Restrict public `list` operations to admins only (`allow list: if isAuthorized();`).
     - Restrict update operations. Allow unauthenticated update if:
       a) ONLY the `status` field is modified, and its new value is `'cancelled'`.
       b) ONLY the `linkedOrderId` field is modified (and optionally only if it wasn't already set, or just checking it is the only modified key).
       c) Or if `isAuthorized()`.
       ```javascript
       allow update: if isAuthorized() || (
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
         request.resource.data.status == 'cancelled'
       ) || (
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
         !('linkedOrderId' in resource.data)
       );
       ```
     - Restrict delete to admins (`allow delete: if isAuthorized();`).

2. Update `src/pages/admin/Settings.jsx`:
   - Add default settings properties `bookingMode: 'enabled'` and `maxCapacityPerHour: 30` in the initial state of `settings`.
   - In `useEffect` (lines 44–72), load `bookingMode` and `maxCapacityPerHour` from the fetched `master` settings document.
     If `bookingMode` is not stored, derive it:
     - If `bookingEnabled === false` -> `bookingMode = 'disabled'`
     - Else if `requirePreOrderForBooking === true` -> `bookingMode = 'preorder'`
     - Else -> `bookingMode = 'enabled'`
     - Set `maxCapacityPerHour` to `data.maxCapacityPerHour || 30` (or `0` if it is explicitly `0` or not set).
   - In `handleChange` (line 74), intercept when `name === 'bookingMode'` is changed. Immediately update `bookingMode` in state, and also update `bookingEnabled` and `requirePreOrderForBooking` in state:
     - If `value === 'disabled'` -> `bookingEnabled = false`, `requirePreOrderForBooking = false`
     - If `value === 'preorder'` -> `bookingEnabled = true`, `requirePreOrderForBooking = true`
     - If `value === 'enabled'` -> `bookingEnabled = true`, `requirePreOrderForBooking = false`
     This ensures reactive UI styling works immediately.
   - Replace the two checkbox labels under "Reservation Rules" with a dropdown for "Booking System Mode" (values: `disabled`, `enabled`, `preorder`) and a number input for "Maximum Capacity Per Hour" (disabled if `settings.bookingEnabled === false`).
   - In `handleSave`, perform validation:
     - Coerce `settings.maxCapacityPerHour` to a number: `Number(settings.maxCapacityPerHour)`.
     - Verify it is a valid non-negative number. If not, trigger an alert and abort.
     - Ensure the coerced number and mapped legacy fields (`bookingEnabled`, `requirePreOrderForBooking`) are saved to `settings/master` in Firestore.

3. Verify:
   - Run the production build command (`npm run build`) in the project root to ensure there are no compilation errors.
   - Run tests if any are available.

Write a complete report of the changes made and the build results to `f:\All restaurents\master-restaurant-template\.agents\worker_m1\handoff.md`. Once done, send a message back to the orchestrator (conversation ID: 4f1dd72a-7492-4ef5-be2d-a849680aec83).
