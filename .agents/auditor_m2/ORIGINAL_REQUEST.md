## 2026-06-12T10:37:34Z
You are Forensic Auditor 2 (archetype teamwork_preview_auditor).
Your working directory is: f:\All restaurents\master-restaurant-template\.agents\auditor_m2
Your task is to perform a final forensic integrity audit on the updated `firestore.rules` and `src/pages/admin/Settings.jsx`.

Perform systematic checks to verify that:
1. The implementation is genuine, free of any hardcoded test results, bypasses, or facade implementations.
2. The Settings UI validation correctly rejects empty, negative, or non-numeric inputs for `maxCapacityPerHour`.
3. The Firestore security rules are robust and secure, checking key existence in `isAuthorized()` to prevent owner lockout when `allowedEmails` is missing, and securely constraining unauthenticated updates on `/reservations/{reservationId}`.
4. The application builds cleanly (`npm run build`).

Write your audit report and final verdict to `f:\All restaurents\master-restaurant-template\.agents\auditor_m2\audit.md`. When done, write `handoff.md` and send a message back to the orchestrator (conversation ID: 4f1dd72a-7492-4ef5-be2d-a849680aec83).
