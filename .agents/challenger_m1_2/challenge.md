# Adversarial Review of Firestore Security Rules

## Challenge Summary

**Overall risk assessment**: MEDIUM

While the reservation update logic for public users is robust and correctly prevents modifications to unauthorized fields (such as changing status to something other than `'cancelled'`, editing multiple fields, or overwriting `linkedOrderId`), a **critical logic/runtime evaluation vulnerability** exists in the administrative authorization check (`isAuthorized()`). Under certain configurations, this can result in the administrative owner being completely locked out from performing admin actions.

---

## Challenges

### [Medium] Challenge 1: Owner Lockout via Runtime Evaluation Failure in `isAuthorized()`

- **Assumption challenged**: The rules assume that if the `/settings/adminConfig` document exists and matches the user's email as `ownerEmail`, the owner will be successfully authorized, even if the `allowedEmails` list is omitted or not defined in the document.
- **Attack scenario / Failure mode**: 
  When the `/settings/adminConfig` document is created or updated such that it does not contain the `allowedEmails` field (or if the field is not a list), evaluating the left-hand side of the `||` operator:
  `request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails`
  causes a **runtime evaluation error** (specifically, trying to access a non-existent property `allowedEmails` on a map). 
  In Firestore Security Rules, any runtime error immediately halts rule evaluation and defaults to `false` (Permission Denied). As a result, the right-hand side check:
  `('ownerEmail' in get(...).data && request.auth.token.email == get(...).data.ownerEmail)`
  is never reached. The legitimate owner (matching `ownerEmail`) is locked out from writing to `/settings`, `/menu`, `/orders`, and performing other administrative actions.
- **Blast radius**: Administrative operations are disabled for the owner. The system can only be configured by the hardcoded super admin fallback.
- **Mitigation**:
  Check for key existence of `allowedEmails` using the `in` operator before attempting to retrieve it:
  ```javascript
  function isAuthorized() {
    return isSuperAdmin() || 
           (request.auth != null && 
            exists(/databases/$(database)/documents/settings/adminConfig) &&
            (('allowedEmails' in get(/databases/$(database)/documents/settings/adminConfig).data &&
              request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails) ||
             ('ownerEmail' in get(/databases/$(database)/documents/settings/adminConfig).data &&
              request.auth.token.email == get(/databases/$(database)/documents/settings/adminConfig).data.ownerEmail)));
  }
  ```

---

## Stress Test Results

We simulated the Firestore Security Rules evaluator against various scenarios using a custom JS-based rule test harness (`tests/rules-simulator.js`).

- **Scenario 1: Public user cancels reservation**
  - Expected behavior: Allow (returns `true`)
  - Actual behavior: `true`
  - Result: **PASS**

- **Scenario 2: Public user tries to confirm reservation**
  - Expected behavior: Deny (returns `false`)
  - Actual behavior: `false`
  - Result: **PASS**

- **Scenario 3: Public user cancels and tries to modify guestCount (multiple fields)**
  - Expected behavior: Deny (returns `false`)
  - Actual behavior: `false`
  - Result: **PASS**

- **Scenario 4: Public user sets `linkedOrderId` (not set initially)**
  - Expected behavior: Allow (returns `true`)
  - Actual behavior: `true`
  - Result: **PASS**

- **Scenario 5: Public user updates `linkedOrderId` (already set)**
  - Expected behavior: Deny (returns `false`)
  - Actual behavior: `false`
  - Result: **PASS**

- **Scenario 6: Public user sets `linkedOrderId` and tries to modify guestCount**
  - Expected behavior: Deny (returns `false`)
  - Actual behavior: `false`
  - Result: **PASS**

- **Scenario 7: Public user tries to query/list all reservations**
  - Expected behavior: Deny (returns `false`)
  - Actual behavior: `false` (via list rule requiring `isAuthorized()`)
  - Result: **PASS**

- **Scenario 8: Owner accesses with complete config (both fields present)**
  - Expected behavior: Allow (returns `true`)
  - Actual behavior: `true`
  - Result: **PASS**

- **Scenario 9: Owner accesses when `allowedEmails` is missing from admin config**
  - Expected behavior: Allow (returns `true`) if fallback logic works; Deny (returns `false`) if runtime evaluation failure occurs.
  - Actual behavior: `false` (due to `Field "allowedEmails" does not exist in map` runtime crash)
  - Result: **FAIL** (Vulnerability Confirmed)

- **Scenario 10: Super Admin accesses when `allowedEmails` is missing**
  - Expected behavior: Allow (returns `true` because `isSuperAdmin()` is evaluated first and short-circuits)
  - Actual behavior: `true`
  - Result: **PASS**

---

## Unchallenged Areas

- **Counters / Menu / Orders write verification** — Not challenged as the focus was specifically on reservations and the `isAuthorized()` core logic. However, since they rely on `isAuthorized()`, any issue there propagates to these paths as well.
