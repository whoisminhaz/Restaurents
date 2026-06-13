# BRIEFING — 2026-06-12T18:47:36+08:00

## Mission
Implement Capacity & Booking Flow requirements (Milestone 2) for the master restaurant template.

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: f:\All restaurents\master-restaurant-template\.agents\worker_m2
- Original parent: 12e2cf5d-474d-48aa-a181-5d135852ee70
- Milestone: Milestone 2

## 🔒 Key Constraints
- Keep implementations genuine (DO NOT CHEAT / hardcode test results).
- Use `setDoc`/`updateDoc` with a custom 5-character alphanumeric uppercase ID inFirestore under `reservations`.
- Display reservation ID on confirmation/success screens.
- Implement capacity checking, disabling full slots, and re-verifying during submit.
- Pre-order logic: handle mandatory/no pre-order options.

## Current Parent
- Conversation ID: 12e2cf5d-474d-48aa-a181-5d135852ee70
- Updated: not yet

## Task Summary
- **What to build**: capacity & booking flow features in Book.jsx and Checkout.jsx.
- **Success criteria**: booking modes respected, custom reservation ID used, overlapping bookings capacity checked and enforced, slots disabled properly, checkout pending reservations saved/updated in Firestore.
- **Interface contracts**: DB collections `settings/master` and `reservations`.
- **Code layout**: `src/pages/public/Book.jsx` and `src/pages/public/Checkout.jsx`.

## Key Decisions Made
- [TBD]

## Artifact Index
- f:\All restaurents\master-restaurant-template\.agents\worker_m2\ORIGINAL_REQUEST.md — Original request instructions.

## Change Tracker
- **Files modified**: None
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: Untested
- **Tests added/modified**: None

## Loaded Skills
- **Source**: android-cli
- **Local copy**: None (not needed for this task)
- **Core methodology**: Android development helper (unused here)
