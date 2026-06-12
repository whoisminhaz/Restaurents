# Restaurant Reservation & Settings System Analysis Report

## Executive Summary
This report presents a detailed technical analysis of the restaurant reservation system, settings management, booking flow, ticket routing, and test/build setup in the master restaurant template codebase. The application is built as a React-based single-page application using Vite, with Cloud Firestore serving as the backend database. 

A critical finding of this analysis is a permission mismatch between the client-side customer actions (reading/updating reservations) and the Firestore Security Rules (`firestore.rules`), which restricts these operations to authenticated admins.

---

## 1. Booking Storage, Management, and Retrieval

### Storage (Backend)
All booking records are stored in **Cloud Firestore** under the `reservations` collection. Individual reservation documents contain the following fields:
*   `name` (string): Customer's name.
*   `phone` (string): Customer's phone number.
*   `date` (string): Reservation date (format: `YYYY-MM-DD`).
*   `time` (string): Selected time slot (e.g., `"06:00 PM"`).
*   `guests` (string/number): Number of guests.
*   `notes` (string, optional): Special instructions.
*   `status` (string): Status of the reservation (`'pending'`, `'confirmed'`, `'completed'`, or `'cancelled'`).
*   `timestamp` (serverTimestamp): Time of creation.
*   `linkedOrderId` (string, optional): Reference to a pre-ordered order's `orderNumber`.
*   `table` (string, optional): Assigned table identifier (e.g., `"5"`).
*   `alertSent` (boolean, optional): Flag indicating if an upcoming reservation alert was sent to the admin's Telegram webhook.

### Temporary Storage (Client-side)
When a customer is required or chooses to pre-order food during the booking flow, the pending booking details are temporarily stored in `localStorage` under the key `pendingReservation` as a JSON string. Once checkout is completed, the reservation is officially written/updated in Firestore and the local storage key is cleared.

### Management & Retrieval
*   **Customer Retrieval**: Customers can query their own bookings on the public booking page by entering their Reservation Document ID or Phone Number. The system fetches documents matching the query where status is `'confirmed'`.
*   **Customer Management**: Customers can cancel their reservation, which calls `updateDoc` to set the document's `status` to `'cancelled'`.
*   **Admin CRM Dashboard**: Admins retrieve all reservations (limited to 150 documents, ordered by timestamp descending) and listen to real-time changes using Firestore `onSnapshot`. Admins manage reservations by assigning tables, confirming requests, completing visits, or declining/cancelling bookings.

---

## 2. Settings Management (`src/pages/admin/Settings.jsx`)

Settings are segregated and stored in two specific documents within the `settings` collection in Firestore:

### A. Settings Document (`settings/master`)
This document stores the public-facing variables and operating rules for the restaurant:
*   `restaurantName` (string): Name of the restaurant.
*   `themePrimary` (string): Hex color code for the primary brand theme (e.g., `"#b5602a"`).
*   `languages` (array of strings): Enabled languages for the customer site (e.g., `['en', 'ms']`).
*   `bankName`, `accountNumber`, `accountHolder` (strings): Direct bank transfer details.
*   `tngQrCode` (string): Base64-encoded compressed image of the Touch 'n Go payment QR code.
*   `discountPercent` (number) & `discountItems` (array of strings): Global discount rate and list of menu item IDs eligible for discounts.
*   `taxPercent` (number): Tax rate percentage.
*   `bookingEnabled` (boolean): Flag to toggle the reservation system on/off.
*   `requirePreOrderForBooking` (boolean): Flag indicating whether food pre-ordering is mandatory for booking.
*   `operatingHoursOpen` & `operatingHoursClose` (strings): Daily opening and closing times (e.g., `"10:00"`, `"22:00"`).
*   `operatingDays` (array of numbers): Operating days of the week represented as day indices (`0` for Sunday, `1` for Monday, etc.).
*   `closedDates` (array of strings): Specific dates the restaurant is closed (e.g., `"2026-12-25"`).
*   `dashboardBg` (string): Base64-encoded compressed background image for the dashboard.

### B. Admin Config Document (`settings/adminConfig`)
This document stores administration access control metadata:
*   `ownerEmail` (string): Primary owner's email address.
*   `allowedEmails` (array of strings): List of authorized employee email addresses who can access the CRM admin dashboard.

---

## 3. Booking Flow Analysis (`src/pages/public/Book.jsx`)

The customer booking interface operates on a tabbed layout: **New Booking** and **Manage Booking**.

```
                           [ Customer Starts Booking ]
                                        │
                                        ▼
                            [ Input Booking Details ]
                        (Name, Phone, Date, Time, Guests)
                                        │
                         Is requirePreOrderForBooking true?
                                ├───────────────┤
                               Yes              No
                                │               │
                                ▼               ▼
                      [ Save to LocalStorage ] [ Save Reservation to DB ]
                      (pendingReservation)     (status: 'pending')
                                │               │
                                ▼               ▼
                        [ Redirect to ]     Show Success / Optional
                        [   /order    ]     Pre-Order Prompt
                                │               │
                                │        Did User Opt to Pre-Order?
                                │        ├────────────────────────┤
                                │       Yes                       No
                                │        │                         │
                                ▼        ▼                         ▼
                        [ Pre-Order Food & Checkout ]           [ Done ]
                         - Create Order (status: 'scheduled')
                         - Link order with reservation
                         - Clear LocalStorage
```

### Detailed Validation Rules
1.  **Date Selection**:
    *   Past dates are blocked by comparing the chosen date against `new Date()` (with time set to 00:00:00).
    *   Specific closed dates defined in `settings.closedDates` are blocked.
    *   Weekly closed days not present in `settings.operatingDays` are blocked.
2.  **Time Slot Generation**:
    *   Generated in 30-minute intervals starting from `operatingHoursOpen` up to 1 hour before `operatingHoursClose` (to account for a 1-hour reservation duration).
    *   If the selected date is *today*, past time slots are filtered out. Furthermore, a 1-hour buffer is enforced (customers must book at least 1 hour in advance).
3.  **Required Pre-Ordering**:
    *   If `settings.requirePreOrderForBooking` is enabled, the form data is saved to `localStorage` under `pendingReservation`, and the page redirects to `/order`.
    *   During checkout, a sequential order is created in the `orders` collection with status `'scheduled'` and table set to `'Pending Table'`.
    *   A new reservation document is subsequently created in the `reservations` collection with status `'pending'` and `linkedOrderId` set to the order's number.
4.  **Optional Pre-Ordering**:
    *   If pre-ordering is not required, the reservation is created immediately in Firestore with status `'pending'`.
    *   On the success page, users are prompted: *"Want the food on your table when you arrive?"*.
    *   If they proceed, the reservation details (including the generated document ID) are saved to `localStorage` under `pendingReservation` and they are redirected to `/order`.
    *   During checkout, the order is created with status `'scheduled'` and the existing reservation document is updated with `linkedOrderId` set to the order's number.

---

## 4. Ticket Routing & CRM Board Management

Ticket routing is split between live kitchen/POS operations (`LiveOrders.jsx`) and reservation planning (`Reservations.jsx`).

### A. Live Orders Routing (`src/pages/admin/LiveOrders.jsx`)
This interface manages real-time customer orders and alerts. Orders are routed across five tabs:
1.  **New Orders & Alerts (Pending)**:
    *   Standard orders with status `'pending'`.
    *   Pre-order reservation orders with status `'scheduled'` where the linked reservation's arrival time is **within 60 minutes** of the current time.
    *   **Upcoming Reservation Alerts**: Confirmed reservations that are within 60 minutes of arrival, do *not* have a linked order, and have not yet had an alert sent (`alertSent` is false). These display as alert cards allowing the admin to send a manual Telegram reminder.
2.  **Processing (Kitchen)**: Orders with status `'processing'`. Moving an order here triggers a Telegram webhook message if configured in Settings.
3.  **Scheduled**: Orders with status `'scheduled'` whose arrival time is **more than 60 minutes** away.
4.  **Completed**: Orders with status `'completed'`.
5.  **Cancelled**: Orders with status `'cancelled'`.

### B. Reservations Routing (`src/pages/admin/Reservations.jsx`)
This interface manages booking schedules. Reservations are categorized into four views:
1.  **Daily Schedule**: Pending and confirmed reservations grouped chronologically by Date -> Time.
2.  **Confirmed Bookings**: Active bookings with status `'confirmed'`.
3.  **Pending Requests**: Unprocessed bookings with status `'pending'`.
4.  **History**: Bookings with status `'completed'` or `'cancelled'`.

#### CRM Board Actions:
*   **Assigning Tables & Confirming**: When confirming a pending reservation, the admin select a table (from 1 to `settings.tables`, default 20) and clicks "Confirm". This sets reservation `status` to `'confirmed'` and updates the `table` field.
*   **Cascading Table Updates**: If the reservation is linked to a pre-order (`linkedOrderId` exists), the system queries the `orders` collection for the order matching `orderNumber == linkedOrderId` and automatically updates that order's `table` field to match the assigned table.
*   **Decline / Cancel**: Sets reservation status to `'cancelled'`.
*   **Complete**: Sets reservation status to `'completed'`.
*   **Delete**: Permanently deletes the reservation document from Firestore.

---

## 5. Security Rules Mismatch (CRITICAL FINDING)

A review of `firestore.rules` reveals a major issue regarding public customers' ability to manage their bookings.

### The Problem
The `firestore.rules` file defines the following access controls for reservations:
```javascript
match /reservations/{document=**} {
  allow create: if true;
  allow read, update, delete: if isAuthorized();
}
```
*   `isAuthorized()` requires the user to be authenticated and have their email listed in the `allowedEmails` array of `settings/adminConfig` (or be the super admin).
*   However, in `src/pages/public/Book.jsx`, the public customer client-side code attempts to:
    1.  **Search Reservation**: Retrieve a reservation document by ID or phone number (lines 181, 192).
    2.  **Cancel Reservation**: Update the reservation status to `'cancelled'` (line 214).
*   Because these actions are executed by unauthenticated public users, the Firestore SDK will throw a **Permission Denied** error when searching or cancelling a reservation from the booking page.

---

## 6. Test and Build Setup

### Test Suite Evaluation
*   **Unit/Integration/E2E Tests**: There are **no test suites** present in the codebase.
*   No directories matching `tests/` or files matching `*.test.*` or `*.spec.*` exist outside of `node_modules`.
*   `package.json` contains no test runner dependencies (like Jest or Vitest) and no test-related script commands.
*   Although `puppeteer` is listed in the dependencies in `package.json`, there are no local test scripts or files implementing it.

### Build Setup
*   **Command**: The build is executed by running `npm run build`, which triggers `vite build`.
*   **Entry Point**: Vite compiles the app starting from the root file `app.html`, which imports `/src/main.jsx`.
*   **Output**: The output is compiled into the `/dist` folder.
*   **Progressive Web App (PWA)**: The build utilizes `vite-plugin-pwa` to generate a service worker (`dist/sw.js`) and precache entries. The build completes successfully (producing `dist/assets/app-*.js` and `dist/assets/app-*.css`).
