# Project: Master Restaurant Reservation Overhaul

## Architecture
- React frontend (Vite)
- Firestore database for state and persistence
- Collections used:
  - `reservations`: Stores reservation records.
  - `orders`: Stores customer orders, including scheduled pre-orders.
  - `settings`: Master public config (`settings/master`) and Admin Config (`settings/adminConfig`).

## Code Layout
- `src/pages/public/Book.jsx`: Main customer reservation interface (New Booking and Manage Booking tabs).
- `src/pages/admin/Settings.jsx`: CRM admin configuration dashboard.
- `src/pages/admin/LiveOrders.jsx`: Real-time order/alert screen for restaurant owners.
- `src/pages/admin/Reservations.jsx`: Scheduled reservations and daily calendar screen.
- `firestore.rules`: Security rules for Firestore.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|-------------|--------|-----------------|
| M1 | Settings & Rules Updates | Add hourly capacity settings & toggles, fix Firestore rules | None | DONE | 4f1dd72a-7492-4ef5-be2d-a849680aec83 |
| M2 | Capacity & Booking Flow | Enforce capacity limits, modes, generate alphanumeric IDs | M1 | PLANNED | |
| M3 | Booking Management | Support retrieval by date + ID/phone, cancel if >1hr | M2 | PLANNED | |
| M4 | Workflow & Ticket Routing | Live orders alert, dynamic UI filter (>1h Scheduled, <1h Live) | M3 | PLANNED | |
| E2E | E2E Testing Suite | Create E2E test harness and test cases (Tiers 1-4) | M4 | PLANNED | |
| M5 | Final E2E Verification | Integrate E2E tests, run full suite, fix bugs | E2E | PLANNED | |
| M6 | Adversarial Hardening | Tier 5 white-box coverage/adversarial testing | M5 | PLANNED | |

## Interface Contracts
### settings/master Document
- Fields:
  - `maxCapacityPerHour`: number
  - `bookingMode`: string ('disabled', 'enabled-no-preorder', 'enabled-mandatory-preorder')
  - (other existing fields)

### reservations Document
- Fields:
  - `id`: string (alphanumeric document ID)
  - `name`: string
  - `phone`: string
  - `date`: string (YYYY-MM-DD)
  - `time`: string (HH:MM or AM/PM format consistent with Book.jsx)
  - `guests`: number
  - `status`: string ('pending' | 'confirmed' | 'cancelled' | 'completed')
  - `table`: string
  - `linkedOrderId`: string
  - `timestamp`: serverTimestamp
