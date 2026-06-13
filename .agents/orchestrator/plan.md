# Project Plan: Master Restaurant Reservation Overhaul

## 1. Problem Taxonomy & Complexity Assessment
- **Category**: SWE / Project
- **Complexity**: High
  - Requires updating both backend Firestore database configurations/security rules and React frontend components.
  - Multi-user interactive flows (Customer booking and managing; admin dash settings and order fulfillment).
  - Dynamic ticket routing logic depending on the time distance to the reservation.
  - Unauthenticated access bypass required for reservation lookup/cancellation in firestore rules.

## 2. Orchestration Strategy
- **Pattern**: Project (Dual Track)
- **Tracks**:
  1. **E2E Testing Track**: Build an automated test suite using Puppeteer testing all customer and admin flows (Tiers 1-4).
  2. **Implementation Track**: Execute milestones sequentially (M1 to M4) and test them manually. Verify with the E2E suite in M5. Hardening in M6.

## 3. Detailed Milestones

### Milestone E2E: E2E Testing Suite
- **Goal**: Create automated tests under a fresh test directory using Puppeteer to run against the local server (`npm run dev`).
- **Tests details**:
  - **Tier 1 (Feature Coverage)**: Basic booking with different modes (disabled, optional pre-order, mandatory pre-order); admin settings changes; customer booking lookup; booking cancellation; live order alert; reservation confirmations.
  - **Tier 2 (Edge cases)**: Booking capacity limits exceeded, cancellation <1hr buffer block, invalid/empty input forms.
  - **Tier 3 (Cross-feature)**: Settings toggles dynamically modifying booking flow in the same session.
  - **Tier 4 (Real-world workload)**: Complete lifecycle of a customer booking from pending -> confirmed -> scheduled -> live orders -> completed.
- **Output**: `TEST_READY.md` containing commands to run the suite.

### Milestone 1: Settings and Firestore Rules Updates (R1)
- **Goal**: Add UI configurations and update Firestore security rules.
- **Tasks**:
  - Update `src/pages/admin/Settings.jsx` to load and save `maxCapacityPerHour` and `bookingMode` (using the three system modes: Disabled, Enabled optional pre-ordering, Enabled mandatory pre-ordering).
  - Update `firestore.rules` to allow public (unauthenticated) users to create, read (by query or doc lookup), and update (specifically set to 'cancelled') reservations.
- **Verification**: Run `npm run build` to verify settings compile. Run manual checks on Firestore emulator rules.

### Milestone 2: Booking Flow & Capacity Checking (R2, R3)
- **Goal**: Implement reservation creation and hourly capacity checks.
- **Tasks**:
  - Update `src/pages/public/Book.jsx` to fetch `settings/master` configuration.
  - If reservations are disabled, display "Sorry, We are not taking Reservations Now!!" and prevent entry.
  - Generate a random 5-character alphanumeric reservation ID (e.g. "AK649") on submission.
  - Enforce hourly capacity limit: Query Firestore for existing reservations on that date and hour that are `confirmed` or `pending` (exclude cancelled). Sum up `guests` count + requested guests. If it exceeds `maxCapacityPerHour`, show a fully booked message and block.
  - Handle mandatory pre-ordering: save reservation details to `localStorage` under `pendingReservation` and route directly to `/order`.
  - Handle optional pre-ordering: submit reservation immediately as `pending` and show prompt to optionally pre-order.
- **Verification**: Perform bookings with optional/mandatory pre-orders. Verify alphanumeric ID is displayed and capacity is blocked correctly.

### Milestone 3: Customer Booking Management (R4)
- **Goal**: Allow customer lookup and cancellation of bookings.
- **Tasks**:
  - Update the "Manage Booking" tab in `src/pages/public/Book.jsx`.
  - Require both booking date AND either Phone Number or Reservation ID.
  - Query Firestore for matching reservations.
  - Display status (Pending, Confirmed with Table Number, Cancelled, Completed).
  - Add a "Cancel Booking" button, active only if the reservation arrival time is > 1 hour away from current local time.
- **Verification**: Retrieve a booking. Verify cancellation button is disabled if reservation is in 30 minutes, but enabled if in 2 hours. Click cancel and verify database status updates.

### Milestone 4: Owner Workflow & Ticket Routing (R5)
- **Goal**: Routing cancellation alerts and dynamic dashboard filtering.
- **Tasks**:
  - Upon customer cancellation, generate a "Booking Cancellation" alert ticket (representing the cancellation) in the Live Orders dashboard of the owner (`src/pages/admin/LiveOrders.jsx`).
  - Owner can acknowledge the cancellation alert, which moves all associated tickets (including the reservation and linked order) to `completed`.
  - Modify `src/pages/admin/LiveOrders.jsx` and `src/pages/admin/Reservations.jsx` to filter confirmed bookings dynamically:
    - Confirmed reservations > 1 hour from current time -> Scheduled view/tab.
    - Confirmed reservations < 1 hour from current time -> Live Orders view/tab.
    - No background data updates are needed; just dynamic frontend filtering.
- **Verification**: Cancel a booking, check that the owner gets an alert ticket in Live Orders, and verify acknowledging it completes/archives both the order and reservation. Verify that confirmed reservations shift from Scheduled to Live Orders based on current time.

### Milestone 5: Final E2E Verification
- **Goal**: Pass 100% of the Puppeteer E2E tests written in Milestone E2E.
- **Tasks**: Run the test suite, analyze any failures, fix bugs, and run until all pass.

### Milestone 6: Adversarial Hardening (Tier 5)
- **Goal**: Generate adversarial tests to find security holes, race conditions, or incorrect UI flows, and fix them.

## 4. Fault Tolerance & Liveness
- Heartbeat: Keep `.agents/orchestrator/progress.md` updated.
- Worker check: Check worker progress logs. If unresponsive for 10 minutes, query/retry; if unresponsive for 20 minutes, kill and respawn.
