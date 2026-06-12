# E2E Test Infrastructure for Restaurant Reservation System

This document outlines the architecture, components, and methodology of the End-to-End (E2E) Puppeteer test suite built for the restaurant reservation system overhaul.

---

## 1. Architecture Overview

To run high-speed, isolated E2E tests without real database pollution, network lag, or third-party authentication popup issues, the suite implements a **completely mocked in-memory Firebase SDK layer** served directly in the front-end bundle.

### Components

1. **Vite E2E Bundling Config (`vite.e2e.config.js`)**:
   Defines a custom compilation plugin (`mock-firebase-plugin`) that intercepts all source code imports pointing to `config/firebase` or the official `firebase/*` modules (such as `firebase/app`, `firebase/auth`, `firebase/firestore`, etc.) and redirects them to our local mock SDK.
   
2. **In-Memory Firebase SDK Mock (`tests/e2e/mock-firebase.js`)**:
   Provides drop-in mock replacements for all auth variables (`auth`, `GoogleAuthProvider`), auth listeners (`onAuthStateChanged`), Firestore methods (`doc`, `collection`, `getDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `addDoc`, `getDocs`, `query`, `where`, `orderBy`, `limit`, `onSnapshot`, `runTransaction`), and server timestamps. All operations persist state directly on the browser window:
   - Firestore state: `window.mockDb`
   - Authentication state: `window.mockAuth`
   
3. **Puppeteer Test Helpers (`tests/e2e/helpers.js`)**:
   Functions that run within the Node test runner and manipulate the page using Puppeteer commands. Exposes actions for:
   - Seeding and resetting database collections on the fly (`seedDb`).
   - Logging in as admin directly by updating `window.mockAuth` (`loginAsAdmin`).
   - Standardizing UI interactions like entering text (`fillInput`), clicking buttons (`clickButton`), and submitting reservation forms (`submitBookingForm`).

4. **Programmatic Test Runner (`tests/e2e/run-tests.js`)**:
   A lightweight, zero-dependency Node script that starts a local Vite server, spins up Puppeteer in headless mode, runs each test case in a clean page context, asserts DOM and database outcomes, prints nice results, and closes server resources on exit.

---

## 2. Test Tiers

The test suite is structured into 4 distinct tiers matching logical testing purposes:

| Tier | Name | Count | Description |
|---|---|---|---|
| **Tier 1** | Feature Coverage | 25 | Exercises all key pathways (routing redirection, customer booking, manage/cancel bookings, menu navigation, cart, checkout, admin portal authentication and logout). |
| **Tier 2** | Boundary & Corner Cases | 25 | Verifies edge behaviors: Same-day booking time buffers, form validation alerts, guest count dropdown options (1–12), special character safety in notes, empty search queries, TnG online reference field lengths (minLength=4), and zero table capacities. |
| **Tier 3** | Cross-Feature Combinations | 5 | Validates interactions between modules: propagation of required pre-order settings, table number syncing across reservations and orders, automatic discount items reduction, tax calculations, and multi-step pre-order lifecycles. |
| **Tier 4** | Real-world Scenarios | 5 | Complete user lifecycles: Booking -> pre-order -> checkout -> admin login -> table confirmation; Walk-in POS checkout; Real-time order kitchen status sync; Settings discount propagation; Table assignment validation. |

---

## 3. Running the Tests

To run the entire test suite programmatically:

```bash
node tests/e2e/run-tests.js
```

### Execution Behavior
- The runner programmatically launches a Vite dev server on port `5173`.
- Tests are executed sequentially.
- Each test case uses a brand new Puppeteer page context, ensuring complete isolation (clean cookies, localStorage, and mock database objects).
- All browser alerts (`alert()`, `confirm()`) are automatically handled and accepted by a Puppeteer dialog listener.
- The script exits with code `0` if all tests pass, and `1` if any test fails, making it ideal for CI/CD integrations.
