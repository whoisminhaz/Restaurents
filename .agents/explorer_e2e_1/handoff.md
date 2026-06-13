# Handoff Report - E2E Requirements Exploration

This report details the user-facing and admin-facing flows, routes, and DOM selectors required for constructing E2E Puppeteer integration tests for the restaurant reservation and pre-ordering system.

---

## 1. Observation

Direct observations and code locations in the repository:

### Admin Login Page (`src/pages/admin/Login.jsx`)
- **Route**: `/login` (from `src/App.jsx` line 45)
- **UI Structure & DOM Selectors**:
  - Form Wrapper: `form.space-y-5` (line 100)
  - Email Address Input: `input[type="email"]` (line 103)
    - Placeholder: `admin@cafebella.com`
    - Label: `Email Address`
  - Password Input: `input[type="password"]` (line 114)
    - Placeholder: `••••••••`
    - Label: `Password`
  - Submit Button: `button[type="submit"]` (line 123)
    - Button Text: `Sign In with Email` (line 131)
  - Google Sign In Button: `button[type="button"]` (line 137)
    - Button Text: `Sign In with Google` (line 149)
  - Error Notification: `div.bg-red-500\/10.border-red-500\/50` (line 95)
- **Authentication Mechanism**:
  - Uses Firebase Auth `signInWithEmailAndPassword` (line 20) and `signInWithPopup` (line 54).
  - Validation checks: The user email must either exist in the `import.meta.env.VITE_ADMIN_EMAILS` array (line 23) or match the `ownerEmail` or `allowedEmails` array inside the Firestore `settings/adminConfig` document (lines 26-31).
  - If unauthorized, the user is signed out (`signOut(auth)`) and shown `Unauthorized access...` (line 35). Otherwise, navigating to `/dashboard` (line 40) is triggered.

### Admin Settings Page (`src/pages/admin/Settings.jsx`)
- **Route**: `/dashboard/settings` (from `src/App.jsx` line 62)
- **UI Structure & DOM Selectors**:
  - Save Changes button: `button.bg-crmAccent` (line 268)
    - Button Text: `Save Changes` (line 274)
  - "Enable Booking System" Checkbox: `input[type="checkbox"]` inside the label containing "Enable Booking System" (line 288).
    - Bound value: `settings.bookingEnabled` (boolean)
  - "Require Pre-order Food" Checkbox: `input[type="checkbox"]` inside the label containing "Require Pre-order Food" (line 301).
    - Bound value: `settings.requirePreOrderForBooking` (boolean)
    - Disabled attribute: `disabled={settings.bookingEnabled === false}` (line 306)
  - Opening Time Input: `input[name="operatingHoursOpen"]` (line 318)
  - Closing Time Input: `input[name="operatingHoursClose"]` (line 328)
  - Save Confirmation Toast: `div.bg-green-500` containing text `Settings saved successfully!` (line 793)
- **Settings Persistence**:
  - Saved to Firestore document `settings/master` via `setDoc(doc(db, 'settings', 'master'), settings)` in the `handleSave` handler (line 244).

### Customer Reservation Page (`src/pages/public/Book.jsx`)
- **Route**: `/book` (redirected from `/` in `src/App.jsx` line 42)
- **UI Structure & DOM Selectors**:
  - Tab controls wrapper: `div.flex.bg-gray-200` (line 375)
    - New Booking tab: Button with text `New Booking` (line 380)
    - Manage Booking tab: Button with text `Manage Booking` (line 384)
  - New Booking Form (`tab === 'book'`):
    - Form wrapper: `form.space-y-6` (line 391)
    - Name Input: `input[name="name"]` (line 408)
    - Phone Input: `input[name="phone"]` (line 421)
    - Date Input: `input[name="date"]` (line 434)
    - Time Select dropdown: `select[name="time"]` (line 447)
    - Guests Select dropdown: `select[name="guests"]` (line 465)
    - Notes Textarea: `textarea[name="notes"]` (line 480)
    - Submit Button: `button[type="submit"]` (line 492)
      - Text: `Request Booking` or `Proceed to Menu` depending on `requirePreOrderForBooking` status (line 498).
  - Validation Rules:
    - Past dates are blocked in `handleChange` (line 70).
    - Holiday dates check: If the selected date is in `settings.closedDates`, it alerts the user (line 78).
    - Operating days check: If the selected date is not in `settings.operatingDays`, it alerts the user (line 83).
    - Time slot generation: Slots are generated at 30-minute intervals ending 1 hour before closing time (line 100).
    - Buffer Rule: If booking for today, slots within a 1-hour buffer of current time are filtered out (`minAllowedTime = new Date(today.getTime() + 60 * 60 * 1000)`) (line 138).
  - Booking Flow Behaviors:
    1. **Disabled Booking/Pre-Ordering** (`settings.bookingEnabled === false`):
       - Automatically renders the "Reservations Closed" screen (line 244) with text `Reservations Closed`.
    2. **Optional Pre-Ordering** (`settings.requirePreOrderForBooking === false`):
       - Submitting the form writes a pending reservation directly to Firestore collection `reservations` (line 159).
       - Navigates to a success receipt screen showing a promotion card containing `Yes, I want to Pre-Order!` button (line 297).
       - Clicking the button stores `{ ...formData, id: createdResId }` in `localStorage.setItem('pendingReservation', ...)` (line 292) and redirects to `/order` (line 293).
    3. **Mandatory Pre-Ordering** (`settings.requirePreOrderForBooking === true`):
       - Submitting the booking form does NOT save to Firestore immediately.
       - It stores `formData` in `localStorage.setItem('pendingReservation', ...)` (line 152) and redirects the user to `/order` (line 153).

### Customer Manage / Cancellation Flow (`src/pages/public/Book.jsx`)
- **UI Structure & DOM Selectors (`tab === 'manage'`):**
  - Search Form wrapper: `form` (line 505)
  - Search Input: `input[name="searchQuery"]` (line 508)
  - Search Button: `button[type="submit"]` containing text `Find Reservation` (line 519)
  - Cancel Reservation Button: `button` containing text `Cancel Reservation` (line 555)
- **Search & Buffer Rules**:
  - Reservation search allows input of either Phone Number or Reservation ID.
  - **Status Restriction**: Search queries strictly require the status of the reservation to be `'confirmed'` (line 184 and 192). Pending, completed, or already cancelled bookings cannot be retrieved or cancelled through this public tab.
  - **Buffer Rule**: There are no front-end time-buffer rules restricting cancellation. If a confirmed reservation is found, the user can click cancel immediately. It triggers a standard browser confirmation: `window.confirm("Are you sure you want to cancel your reservation?")` (line 211) and updates the status to `'cancelled'` in Firestore.

### Menu Selection and Pre-ordering Checkout (`src/pages/public/MenuOrder.jsx`, `src/pages/public/Checkout.jsx`)
- **Menu Route**: `/order`
- **UI Structure & DOM Selectors**:
  - Category buttons: `button` containing category names (e.g. `Mains`, `Drinks`, `Desserts`, `Add-ons`) (line 120).
  - Add to Cart Button (Card Plus): `button` with plus icon inside a food item card (line 185) or plus button inside qty controls (line 176).
  - View Cart Floating Button: `div.fixed.bottom-6` wrapper (line 201). Clicking this navigates to `/checkout` (line 203).
- **Checkout Route**: `/checkout`
- **UI Structure & DOM Selectors**:
  - Customer Details Pre-fill: Customer Name (`customerName`) and Phone (`phone`) are automatically parsed and prefilled from `localStorage.getItem('pendingReservation')` (lines 15-22).
  - Payment Method Radio Options:
    - Counter / Cash: `input[type="radio"][value="counter"]` (line 424) — *Note: Hidden for pre-orders (`!isPreOrder` condition line 421)*.
    - Online Transfer: `input[type="radio"][value="online"]` (line 432).
    - DuitNow QR: `input[type="radio"][value="tng"]` (line 439).
    - Touch n Go eWallet: `input[type="radio"][value="ewallet"]` (line 446).
  - Payment Reference Input (Required for Online, TNG QR, and eWallet modes):
    - Selector: `input[placeholder="e.g. 1234"]` (lines 474, 500, 533)
    - Input constraints: `minLength={4}`, `required` attribute enabled when active.
  - Place Order Button: `button[type="submit"]` containing text `Place Order` (line 542).
- **Submission Logic**:
  - Creates an order in Firestore collection `orders`.
  - Order status is set to `'scheduled'` (if it is a pre-order) or `'pending'` (if regular order).
  - Table field is set to `'Pending Table'` (if pre-order) or table number (if regular dine-in order).
  - Order mode is set to `'dineIn'` (if pre-order).
  - Reservation processing:
    - If Optional Pre-order (reservation ID exists in `pendingReservation`): Updates existing reservation doc to attach `linkedOrderId: orderNumber` (line 128).
    - If Mandatory Pre-order (reservation ID does not exist): Creates a new reservation document in the `reservations` collection with status `'pending'` and links `linkedOrderId: orderNumber` (line 133).
  - Clears `localStorage.removeItem('pendingReservation')`.
  - Shows success receipt showing Order Number `#{orderNumber}` (line 175) and download receipt button (line 222).

### Owner Reservation Dashboard (`src/pages/admin/Reservations.jsx`)
- **Route**: `/dashboard/reservations`
- **UI Structure & DOM Selectors**:
  - View Tab Buttons:
    - Daily Schedule: button containing text `Daily Schedule` (line 201). Sets state view to `'schedule'`.
    - Confirmed Bookings: button containing text `Confirmed Bookings` (line 207). Sets state view to `'confirmed'`.
    - Pending Requests: button containing text `Pending Requests` (line 213). Sets state view to `'requests'`.
    - History: button containing text `History` (line 220). Sets state view to `'history'`.
  - Action elements on `ReservationCard` (`src/pages/admin/Reservations.jsx` line 9):
    - Assign Table dropdown: `select` inside the reservation card (line 77). Populated with options `Table 1` to `Table N` (representing total tables configured in settings).
    - Decline Button (Pending requests): button containing text `Decline` (line 89). Sets status to `'cancelled'`.
    - Confirm Button (Pending requests): button containing text `Confirm` (line 90). Sets status to `'confirmed'`. *Note: Disabled if no table is selected (`disabled={busy || !selectedTable}`)*.
    - Cancel Button (Confirmed bookings): button containing text `Cancel` (line 101). Sets status to `'cancelled'`.
    - Complete Button (Confirmed bookings): button containing text `Complete` (line 102). Sets status to `'completed'`.
    - Remove from list button (Pending requests): button containing text `Remove from list` (line 95). Calls `onDelete` which deletes the reservation document from Firestore (line 160).
- **Acknowledgment Sync Logic**:
  - Confirming a reservation (calling `handleUpdateStatus` line 137) updates the status to `'confirmed'` and stores the assigned table number in the reservation document.
  - If a pre-order is linked (`linkedOrderId` exists), the system automatically queries the `orders` collection where `orderNumber == linkedOrderId` and updates the order's `table` field to match the assigned table number (lines 148-153).

---

## 2. Logic Chain

1. **Admin Authentication**: Reading `Login.jsx` directly shows that form submit executes `handleLogin` which signs in via Firebase and verifies authorization against `settings/adminConfig` owner and staff emails, redirecting to `/dashboard` on success.
2. **Settings Configurations**: Checking `Settings.jsx` reveals two main boolean checkboxes (`bookingEnabled` and `requirePreOrderForBooking`) which are sent to `settings/master` in Firestore.
3. **Reservation Form Behaviors**: Reading `Book.jsx` shows the UI branches into three flows depending on those settings:
   - If `bookingEnabled === false`, booking is entirely disabled.
   - If `requirePreOrderForBooking === false`, submitting the booking form immediately writes to the `reservations` collection and prompts an optional pre-order.
   - If `requirePreOrderForBooking === true`, submission is intercepted and redirected to `/order` via `localStorage` storage.
4. **Pre-order and Checkout**: Reading `MenuOrder.jsx` and `Checkout.jsx` reveals that pre-orders pre-fill customer details from `localStorage`, restrict payment to non-counter modes, and use Firestore transactions to assign a sequential daily order number. It then links the order to either a new (mandatory) or existing (optional) reservation doc, setting the order's status to `'scheduled'` and table to `'Pending Table'`.
5. **Search and Cancellation**: Analyzing `Book.jsx` lines 174-225 indicates that the public search tab only returns results matching `status === 'confirmed'`. Once found, clicking the cancel button updates the status to `'cancelled'` in Firestore.
6. **Owner Reservation Management**: Inspection of `Reservations.jsx` shows that confirming a reservation requires choosing a table, which is then written to the reservation document. If the reservation contains a `linkedOrderId`, the order is queried and its `table` field is updated dynamically to synchronize the dine-in location.

---

## 3. Caveats

- **Time-Buffer for Cancellation**: There is no front-end check validating whether a cancellation request is within a specific time boundary (e.g. at least 2 hours before the reservation). Any confirmed reservation can be cancelled immediately through the public manage tab.
- **Search Tab Constraints**: Customers cannot search for or cancel a reservation that is still in `'pending'` status. They must wait until it is `'confirmed'` by the owner before it can be fetched via phone or reservation ID.
- **Google Login in E2E**: E2E Puppeteer scripts testing Google Sign-In will require a mock Google auth handler or pre-authenticated Firebase sessions since real Google popup login forms are difficult to automate.

---

## 4. Conclusion

The application follows a structured set of rules for reservations and pre-ordering:
1. **Admin login** relies on Firebase Authentication + custom whitelist checks in Firestore `settings/adminConfig`.
2. **Settings** dictate customer reservation routes (Disabled/Optional/Mandatory pre-order).
3. **Pre-ordering** creates a `'scheduled'` order with `'Pending Table'` dine-in properties, which requires online/QR payments.
4. **Reservation confirmation** by the owner links the chosen table back to the order table field, successfully completing the E2E lifecycle.

All required routes and DOM selectors have been successfully identified and documented.

---

## 5. Verification Method

To verify these findings manually:
1. **Login Flow**: Open `/login`, inspect the input fields to confirm they have `type="email"` and `type="password"` properties, and check that the submit button has `type="submit"`.
2. **Settings Flow**: Log in as an admin, navigate to `/dashboard/settings`, toggle the booking and pre-ordering checkboxes, click "Save Changes" and verify that the toast notifications and Firestore document `settings/master` reflect the update.
3. **Booking Form Flow**: Toggle the pre-order settings, and navigate to `/book` to check if:
   - "Reservations Closed" renders when booking is disabled.
   - Redirect to `/order` happens on submit when pre-ordering is mandatory.
   - Successful reservation receipt screen shows with optional pre-ordering banner when pre-ordering is optional.
4. **Manage Booking**: Search for a pending reservation using the public manage tab to confirm it is not found, confirm it becomes searchable once set to `'confirmed'` by the admin, and verify cancellation updates the document status to `'cancelled'` in Firestore.
5. **Owner Reservation Sync**: In `/dashboard/reservations`, assign a table and confirm a booking that has an associated pre-order. Verify that the table number is updated on both the reservation and the linked order document in the Firestore database.
