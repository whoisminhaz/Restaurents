# Scope: E2E Testing Suite

## Objectives
- Set up a comprehensive E2E Puppeteer test suite running against the local Vite development server (`npm run dev`).
- The test suite must be opaque-box, requirement-driven, and independent of implementation details.
- Create tests following the 4-tier model (Tiers 1-4):
  - Tier 1: Feature Coverage (Disabled mode, Enabled optional pre-ordering, Enabled mandatory pre-ordering, customer search/cancellation, owner ticket routing/acknowledgement).
  - Tier 2: Boundary & Corner cases (Capacity limit booking blocking, cancellation time-limit buffer checking, form validations).
  - Tier 3: Cross-Feature combinations (Settings updates changing customer flow dynamically).
  - Tier 4: Real-world scenarios (Full lifecycle from creation to owner completion).
- Write `TEST_INFRA.md` and `TEST_READY.md` at project root.

## Code Layout
- All E2E test files and runners must be placed in a clean directory such as `tests/e2e/`.
- Must not interfere with the application's source code in `src/`.
