## 2026-06-12T18:32:56+08:00
You are Reviewer 2 (archetype teamwork_preview_reviewer).
Your working directory is: f:\All restaurents\master-restaurant-template\.agents\reviewer_m1_2
Your task is to review the security rules changes implemented for Milestone 1 in `firestore.rules`.

Specifically:
- Verify that `isAuthorized()` correctly supports authorization for both `allowedEmails` and `ownerEmail`.
- Verify the rules for `/reservations/{reservationId}`:
  - Allow unauthenticated `create` and `get`.
  - Restrict unauthenticated `list` to admins.
  - Allow unauthenticated `update` only if:
    a) `status` is changed to `'cancelled'` and it is the ONLY changed field, or
    b) `linkedOrderId` is modified and it is the ONLY changed field (and optionally only if it wasn't already set).
    Ensure no other fields can be publically modified.
  - Restrict delete to admins.
- Ensure the rule definitions are syntactically correct according to Cloud Firestore rules rules_version = '2'.

Write your review report to `f:\All restaurents\master-restaurant-template\.agents\reviewer_m1_2\review.md`. When done, write `handoff.md` and send a message back to the orchestrator (conversation ID: 4f1dd72a-7492-4ef5-be2d-a849680aec83).
