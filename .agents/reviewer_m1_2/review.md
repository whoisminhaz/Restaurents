# Review Report — Milestone 1 Firestore Security Rules

## Review Summary

**Verdict**: APPROVE

The security rules changes in `firestore.rules` for Milestone 1 successfully implement all required functionality:
- `isAuthorized()` supports authorization for both `allowedEmails` and `ownerEmail`.
- Unauthenticated users can `create` and `get` reservations, but cannot `list` or `delete` them.
- Public `update` on reservations is strictly restricted to:
  - Changing `status` to `'cancelled'` as the only modified field.
  - Adding/modifying `linkedOrderId` as the only modified field when it wasn't already set.
- The rules syntax is correct under `rules_version = '2'`.

Several major and minor findings have been identified regarding robustness and security design, which should be addressed in subsequent milestones.

---

## Findings

### Major Finding 1: Potential Owner Lockout via Missing `allowedEmails` Key
- **What**: Lack of key-existence guard for `allowedEmails` inside `isAuthorized()`.
- **Where**: `firestore.rules`, lines 11–18.
- **Why**: The rule checks `request.auth.token.email in get(...).data.allowedEmails`. If the `allowedEmails` field is missing or not a list in the `/settings/adminConfig` document, this check throws a runtime evaluation error. In Firestore rules, any runtime error aborts the parent expression immediately and denies the request, meaning even if `ownerEmail` is correctly set and matches, the user is locked out.
- **Suggestion**: Add a key-existence guard for `allowedEmails` similar to `ownerEmail`:
  ```javascript
  (('allowedEmails' in get(/databases/$(database)/documents/settings/adminConfig).data) &&
   (request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails))
  ```

### Major Finding 2: Insecure Public Counters Collection
- **What**: Overly permissive wildcard rules for `/counters`.
- **Where**: `firestore.rules`, lines 49–51.
- **Why**: The rule `allow read, write: if true;` allows unauthenticated clients to overwrite, corrupt, or delete counters used for order numbering.
- **Suggestion**: Restrict writes to only increment operations or enforce authentication/admin privileges if managed by backend services.

---

## Verified Claims

- **Claim 1**: `isAuthorized()` correctly supports authorization for both `allowedEmails` and `ownerEmail` -> **VERIFIED (PASS)**.
  - *Method*: Inspected the boolean structure in `firestore.rules` lines 11-18. It successfully checks if the email is in the `allowedEmails` list OR if it matches `ownerEmail` (while checking that the document exists and `ownerEmail` key exists).
- **Claim 2**: Unauthenticated `create` and `get` allowed for reservations -> **VERIFIED (PASS)**.
  - *Method*: Verified line 36 `allow create, get: if true;` is present.
- **Claim 3**: `list` and `delete` restricted to admins -> **VERIFIED (PASS)**.
  - *Method*: Verified lines 37 and 45 evaluate `isAuthorized()` for `list` and `delete`.
- **Claim 4**: Unauthenticated `update` restricted to status cancellation or order linking -> **VERIFIED (PASS)**.
  - *Method*: Verified lines 38-44. Uses `affectedKeys().hasOnly(['status'])` and `affectedKeys().hasOnly(['linkedOrderId'])` to ensure no other fields are changed.
- **Claim 5**: Syntax complies with `rules_version = '2'` -> **VERIFIED (PASS)**.
  - *Method*: Verified line 1 `rules_version = '2';` and checked rule construct syntax.

---

## Coverage Gaps

- None. All requirements for Milestone 1 Firestore security rules were fully analyzed.

---

## Unverified Items

- None. All claims have been statically verified.

---
---

## Challenge Summary

**Overall risk assessment**: MEDIUM

While the security rules satisfy the requested logic, they introduce risks of runtime crashes under specific document structures and expose document data to IDOR exploitation.

## Challenges

### Medium Challenge 1: IDOR on Reservation Retrieval
- **Assumption challenged**: Reservation IDs are unguessable.
- **Attack scenario**: If reservation IDs are sequential (e.g. `1`, `2`, `3`), an unauthenticated user can enumerate IDs to retrieve other customers' names, emails, and phone numbers via `get`.
- **Blast radius**: Information disclosure of all customer reservations.
- **Mitigation**: Ensure the app uses randomly-generated cryptographically secure 20-character Firestore IDs.

### Medium Challenge 2: Counter Corruption
- **Assumption challenged**: The checkout flow requires public write access to counters.
- **Attack scenario**: A malicious script increments or deletes counter documents in `/counters`, breaking the order numbering sequence and causing database transaction collisions.
- **Blast radius**: Breakdown of the checkout system.
- **Mitigation**: Handle counters in a Cloud Function or restrict the `write` rule to only allow positive increments.

---

## Stress Test Results

- **Scenario A**: Unauthenticated user cancels a reservation by sending an update where `status` is set to `'cancelled'` and no other fields are modified.
  - *Expected behavior*: Allowed.
  - *Predicted behavior*: Allowed (`affectedKeys().hasOnly(['status'])` is true, and `status == 'cancelled'`).
- **Scenario B**: Unauthenticated user attempts to cancel a reservation and modify the `customerName` field in the same update.
  - *Expected behavior*: Denied.
  - *Predicted behavior*: Denied (`affectedKeys()` is `['status', 'customerName']`, so `hasOnly(['status'])` returns false).
- **Scenario C**: Unauthenticated user sets `linkedOrderId` on a reservation that does not have it set.
  - *Expected behavior*: Allowed.
  - *Predicted behavior*: Allowed (`affectedKeys().hasOnly(['linkedOrderId'])` is true, and `!('linkedOrderId' in resource.data)` is true).
- **Scenario D**: Unauthenticated user attempts to change `linkedOrderId` after it was already set.
  - *Expected behavior*: Denied.
  - *Predicted behavior*: Denied (`!('linkedOrderId' in resource.data)` is false).

## Unchallenged Areas

- **Backend Integration**: How Firestore rules handle edge cases in custom JWT token claims (e.g., missing email addresses for certain providers).
