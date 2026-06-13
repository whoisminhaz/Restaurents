## 2026-06-12T10:31:27Z

You are the E2E Testing Worker (archetype teamwork_preview_worker).
Your working directory is f:\All restaurents\master-restaurant-template\.agents\worker_e2e_1\.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task is to build and verify the E2E Puppeteer test suite for the restaurant reservation system overhaul.

Here is the exact plan of files to create and edit:

1. Create `vite.e2e.config.js` at project root. This should define a custom plugin to resolve relative imports to `config/firebase` (e.g. `src/config/firebase.js` or `../../config/firebase`) and redirect them to `tests/e2e/mock-firebase.js`.
2. Create `tests/e2e/mock-firebase.js` containing an in-memory mock of the Firebase SDK exports used by the app:
   - Firestore variables and methods: `db`, `collection`, `addDoc`, `serverTimestamp`, `doc`, `getDoc`, `updateDoc`, `query`, `where`, `getDocs`, `setDoc`, `deleteDoc`, `orderBy`, `onSnapshot`, `limit`, `runTransaction`
   - Auth variables and methods: `auth`, `signInWithEmailAndPassword`, `signInWithPopup`, `GoogleAuthProvider`, `signOut`, `onAuthStateChanged`, `setPersistence`
   - The mock should store data in `window.mockDb` and user state in `window.mockAuth`. Seeding must be possible by editing these window variables directly from Puppeteer. Include default seeded values for `settings/master` (bookingEnabled: true, tables: 5) and `settings/adminConfig` (ownerEmail: 'admin@cafebella.com').
3. Create `tests/e2e/helpers.js` with Puppeteer helper functions:
   - Seeding database state on the page.
   - Injecting auth session state on the page.
   - Performing common UI actions like filling fields, submitting booking form, clicking buttons.
4. Create test files under `tests/e2e/`:
   - `tests/e2e/tier1.test.js`: Feature Coverage (25 test cases).
   - `tests/e2e/tier2.test.js`: Boundary & Corner cases (25 test cases testing same-day booking time buffers, form validation alerts, guest count dropdown options, payment reference lengths).
   - `tests/e2e/tier3.test.js`: Cross-Feature combinations (5 test cases testing settings propagation, table sync with orders, discount & tax calculations).
   - `tests/e2e/tier4.test.js`: Real-world scenarios (5 test cases running full lifecycles, e.g. booking -> pre-order -> checkout -> admin login -> confirm table -> complete).
5. Create `tests/e2e/run-tests.js` as the main programmatic runner. It must start the Vite server programmatically using `createServer` from `vite`, run all test files using Puppeteer (launching in headless mode, performing assertions, printing nice test pass/fail results), and finally shut down the Vite server, exiting with code 0 if all tests pass.
6. Write `TEST_INFRA.md` at project root detailing the E2E architecture, features, and methodology.
7. Verify the test suite runs correctly by executing the runner command.
8. Once all tests pass, write `TEST_READY.md` at project root with a test tier coverage summary and feature checklist.
9. Report back in your handoff.md under your working directory, detailing the test command, test execution results, and files modified.
