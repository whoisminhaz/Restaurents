# Milestone 1 Verification and Challenge Findings

**Overall Risk Assessment**: LOW

This report documents the empirical verification and stress testing of fixes implemented for Milestone 1 in `firestore.rules` and `src/pages/admin/Settings.jsx`.

---

## 1. Firestore Security Rules Verification

The new Firestore rules implement dynamic authorization checks for settings, menus, and orders, along with special exceptions for reservations.

### Scenario 9: Owner Email Check with Missing `allowedEmails`
- **Logic Inspected**: 
  ```javascript
  (('allowedEmails' in get(/databases/$(database)/documents/settings/adminConfig).data &&
    request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails) ||
   ('ownerEmail' in get(/databases/$(database)/documents/settings/adminConfig).data &&
    request.auth.token.email == get(/databases/$(database)/documents/settings/adminConfig).data.ownerEmail))
  ```
- **Findings**:
  - The check `'allowedEmails' in get(...).data` acts as a guard. If the `allowedEmails` key is missing, this term evaluates to `false` and short-circuits.
  - Due to short-circuiting, the rules evaluator never attempts to read `get(...).data.allowedEmails`, avoiding a Firestore Rules runtime crash (which would have aborted evaluation and denied access).
  - The evaluator then successfully proceeds to check the second operand of the `||` (`'ownerEmail' in get(...).data && ...`). Since the owner's email matches, access is allowed.
  - **Empirical Proof**: Verified via simulation test case `"Scenario 9: Owner accesses when allowedEmails is missing"` (Result: `true`).

### Scenario 10: Super Admin Check
- **Logic Inspected**:
  ```javascript
  function isSuperAdmin() {
    return request.auth != null && request.auth.token.email == "minhazuddin7827@gmail.com";
  }
  ```
- **Findings**:
  - The Super Admin bypass is evaluated first: `isSuperAdmin() || (...)`.
  - If the user is authenticated as the Super Admin, the check immediately returns `true` and short-circuits, completely bypassing the dynamic roles check (which requires document existence/parsing).
  - This ensures that even if `adminConfig` is missing entirely or in an invalid state, the Super Admin can still log in and write configurations.
  - **Empirical Proof**: Verified via simulation test cases `"Scenario 10: Super Admin accesses when allowedEmails is missing"` (Result: `true`) and `"Scenario 10: Super Admin accesses under complete config"` (Result: `true`).

### Unauthenticated Cancellations & Order Linking
- **Logic Inspected (Reservations matches)**:
  ```javascript
  allow update: if isAuthorized() || (
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
    request.resource.data.status == 'cancelled'
  ) || (
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
    !('linkedOrderId' in resource.data)
  );
  ```
- **Findings**:
  - **Unauthenticated Cancellations**: An unauthenticated user can cancel a reservation by modifying *only* the `status` field to `'cancelled'`. If they try to modify any other field (e.g., guest count, date), the diff fails and the request is rejected.
  - **Unauthenticated Order Linking**: An unauthenticated user can link an order to a reservation by modifying *only* the `linkedOrderId` field, but *only* if `linkedOrderId` is not already set (`!('linkedOrderId' in resource.data)`). If they attempt to overwrite an existing link or update other fields, the check fails.
  - **Empirical Proof**:
    - `"Public user cancels reservation"` -> `true`
    - `"Public user cancels and modifies guestCount"` -> `false`
    - `"Public user sets linkedOrderId (not set initially)"` -> `true`
    - `"Public user updates linkedOrderId (already set)"` -> `false`
    - `"Public user sets linkedOrderId and modifies guestCount"` -> `false`

---

## 2. UI Settings Validation (`src/pages/admin/Settings.jsx`)

The React component validation for `maxCapacityPerHour` was reviewed and verified.

- **Required/Blank Check**:
  ```javascript
  if (settings.maxCapacityPerHour === undefined || settings.maxCapacityPerHour === null || String(settings.maxCapacityPerHour).trim() === '') {
    alert("Maximum Capacity Per Hour is required.");
    return;
  }
  ```
  - **Verification**: This successfully blocks empty/blank input fields and alerts `"Maximum Capacity Per Hour is required."`.
  
- **Numeric/Negative Check**:
  ```javascript
  const maxCapacity = Number(settings.maxCapacityPerHour);
  if (isNaN(maxCapacity) || maxCapacity < 0) {
    alert("Maximum Capacity Per Hour must be a valid non-negative number.");
    return;
  }
  ```
  - **Verification**: This correctly converts the value to a number and checks if it is `NaN` (non-numeric) or `< 0` (negative). It alerts `"Maximum Capacity Per Hour must be a valid non-negative number."` and aborts if invalid.

- **Database Save**:
  On success, the numeric value is saved to Firestore under `settings/master` document:
  ```javascript
  const updatedSettings = {
    ...settings,
    maxCapacityPerHour: maxCapacity
  };
  await setDoc(doc(db, 'settings', 'master'), updatedSettings);
  ```

---

## 3. Application Build Verification

- Run Command: `npm run build`
- Result: **SUCCESS**
  - Built cleanly in `19.95s`.
  - Output files generated under `dist/` with no compilation or syntax errors.
  - Precached 10 entries (919.06 KiB) via Vite PWA.

---

## 4. Adversarial Challenges & Stress Testing

### Challenge 1: Type Coercion / String input in capacity fields
- *Scenario*: User inputs float values (e.g. `30.5`) in `maxCapacityPerHour`.
- *Behavior*: `Number("30.5")` is `30.5` which passes validation (is non-negative and numeric). It will be saved as `30.5` in Firestore.
- *Risk*: Low, but capacity should normally be an integer.
- *Mitigation*: (Optional UI polish) Use `Math.floor()` or check `Number.isInteger(maxCapacity)` if integer capacity is strictly required.

### Challenge 2: Missing config document entirely
- *Scenario*: Settings collection does not contain the `adminConfig` document.
- *Behavior*: `exists()` returns false in Firestore Rules. The rules check `exists(/databases/$(database)/documents/settings/adminConfig)` which evaluates to `false` and short-circuits. Super Admins still have access.
- *Risk*: None. Access is safely denied to normal owners/users until the document is created.
