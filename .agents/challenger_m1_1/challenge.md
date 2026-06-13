## Challenge Summary

**Overall risk assessment**: MEDIUM

While the validation for `maxCapacityPerHour` correctly prevents invalid negative and non-numeric inputs from being saved via the UI, several critical vulnerabilities and functional gaps exist in the UI settings validation and schema compatibility.

Specifically:
1. **Empty input values for `maxCapacityPerHour` are saved as `0`**: Clearing the field converts the empty string `""` to `0`, bypassing validation and storing `0` in Firestore.
2. **Lack of save-time validation on other numeric inputs**: Fields like `discountPercent` and `taxPercent` have no validation checks in `handleSave()`. A malicious user can bypass browser HTML constraints to save values like `-10` or `150` to Firestore, resulting in negative item prices in `MenuOrder.jsx` (High Risk).
3. **No type normalization on save**: Numeric values like `discountPercent`, `taxPercent`, and `tables` are saved as strings in the database, relying on JavaScript's implicit conversion which could break under strict comparisons or additions.
4. **`maxCapacityPerHour` is not enforced in the booking system**: The public page `Book.jsx` never checks current reservations against `maxCapacityPerHour` to prevent overbooking, making this setting non-functional.

---

## Challenges

### [Medium] Challenge 1: Empty `maxCapacityPerHour` Input Evaluates to `0`

- **Assumption challenged**: The validation logic `isNaN(maxCapacity) || maxCapacity < 0` is sufficient to catch all invalid or empty inputs.
- **Attack scenario**: A user clears the "Maximum Capacity Per Hour" text box (setting `settings.maxCapacityPerHour` to `""`) and clicks Save. In JavaScript, `Number("")` evaluates to `0`. Since `0` is a valid number and is not less than `0`, validation passes and saves `maxCapacityPerHour = 0` to Firestore.
- **Blast radius**: Low. When settings are fetched next, `Settings.jsx` loads it as `0`. If capacity checks were enforced, a capacity of `0` would block all bookings.
- **Mitigation**: Add an explicit check for empty strings in `handleSave`:
  ```javascript
  const maxCapacityStr = String(settings.maxCapacityPerHour).trim();
  if (maxCapacityStr === "" || isNaN(Number(maxCapacityStr)) || Number(maxCapacityStr) < 0) {
    alert("Maximum Capacity Per Hour must be a valid non-negative number.");
    return;
  }
  ```

### [High] Challenge 2: Lack of Save-Time Validation for `discountPercent` and `taxPercent`

- **Assumption challenged**: UI input element constraints (`min="0" max="100"`) are sufficient to guarantee valid rates are saved.
- **Attack scenario**: A user alters the input attributes or intercept the form submit to provide invalid percentages (e.g. `discountPercent: 150` or `-10`). Because `handleSave` contains no validation for discount or tax percentages, these values are written directly to Firestore.
- **Blast radius**: High.
  - If `discountPercent` is `150`, then in `MenuOrder.jsx`, the customer menu will calculate item prices as: `activePrice = price * (1 - 1.5) = price * -0.5`, resulting in **negative item prices** and negative checkout totals.
  - If `taxPercent` is negative or extremely large, the checkout calculation in `Checkout.jsx` will be corrupted.
- **Mitigation**: Validate both percentages in `handleSave` before writing to Firestore:
  ```javascript
  const discount = Number(settings.discountPercent);
  if (isNaN(discount) || discount < 0 || discount > 100) {
    alert("Discount Percentage must be between 0 and 100.");
    return;
  }
  const tax = Number(settings.taxPercent);
  if (isNaN(tax) || tax < 0 || tax > 100) {
    alert("Tax Percentage must be between 0 and 100.");
    return;
  }
  ```

### [Medium] Challenge 3: Settings are Saved as Strings in Firestore

- **Assumption challenged**: Numeric fields loaded from settings are proper numbers.
- **Attack scenario**: The UI saves settings directly from the input change handler, meaning `discountPercent`, `taxPercent`, and `tables` are stored as string values in Firestore (e.g., `"10"`).
- **Blast radius**: Medium. While loose comparisons and division in JS work, addition operations (e.g. `settings.tables + 5`) would lead to string concatenation (e.g., `"205"` instead of `25`).
- **Mitigation**: Normalize and cast numeric fields when setting `updatedSettings` in `handleSave`:
  ```javascript
  const updatedSettings = {
    ...settings,
    maxCapacityPerHour: maxCapacity,
    discountPercent: Number(settings.discountPercent) || 0,
    taxPercent: Number(settings.taxPercent) || 0,
    tables: Number(settings.tables) || 20
  };
  ```

### [Medium] Challenge 4: Max Capacity Per Hour is Never Enforced

- **Assumption challenged**: The setting `maxCapacityPerHour` restricts bookings to prevent overbooking.
- **Attack scenario**: In `Book.jsx`, the reservation slot generator and submission form fetch the `settings/master` document, but they never query active Firestore reservations to count how many bookings already exist for the selected date/time slot, nor do they validate against `maxCapacityPerHour`.
- **Blast radius**: Medium. The setting is completely non-functional for restricting reservation counts.
- **Mitigation**: Query active reservations for the selected date and time, and verify that the count is less than `maxCapacityPerHour` before allowing a booking request.

---

## Stress Test Results

- **Negative value for `maxCapacityPerHour` (e.g. `-10`)** → Prevent Save & Alert → Correctly handled (Pass)
- **Non-numeric value for `maxCapacityPerHour` (e.g. `"abc"`)** → Prevent Save & Alert → Correctly handled (Pass)
- **Empty value for `maxCapacityPerHour` (e.g. `""`)** → Prevent Save & Alert / Reset to default → Saves as `0` in DB (Fail)
- **Extreme values for `discountPercent`/`taxPercent` (e.g. `150`)** → Prevent Save & Alert → Bypasses UI limits and saves (Fail)
- **Schema & Legacy Boolean Compatibility** → System processes legacy boolean configs safely in `Settings.jsx` and resolves to standard modes. Pages like `Book.jsx` read the fallback properties (`bookingEnabled`, `requirePreOrderForBooking`) safely. (Pass)
- **Build Success Check** → Runs `npm run build` to verify bundler success → Build succeeds with no bundle errors. (Pass)

---

## Unchallenged Areas

- **Firebase Rules Integration** — Did not simulate read/write permissions directly on Firestore rules during mock updates due to scope focusing purely on UI settings validation code.
