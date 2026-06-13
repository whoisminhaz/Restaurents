# Handoff Report

## 1. Observation
Direct observations in the codebase include:
- In `src/pages/admin/Settings.jsx` (lines 286-309):
  ```javascript
  const handleSave = async () => {
    const maxCapacity = Number(settings.maxCapacityPerHour);
    if (isNaN(maxCapacity) || maxCapacity < 0) {
      alert("Maximum Capacity Per Hour must be a valid non-negative number.");
      return;
    }

    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        maxCapacityPerHour: maxCapacity
      };
      await setDoc(doc(db, 'settings', 'master'), updatedSettings);
      setSettings(updatedSettings);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Check permissions.");
    } finally {
      setSaving(false);
    }
  };
  ```
- In `src/pages/admin/Settings.jsx` (lines 53-62):
  ```javascript
  let bookingMode = data.bookingMode;
  if (!bookingMode) {
    if (data.bookingEnabled === false) {
      bookingMode = 'disabled';
    } else if (data.requirePreOrderForBooking === true) {
      bookingMode = 'preorder';
    } else {
      bookingMode = 'enabled';
    }
  }
  ```
- In `src/pages/public/Book.jsx` (lines 244-245):
  ```javascript
  if (settings.bookingEnabled === false) {
    return (
  ```
- In `src/pages/public/MenuOrder.jsx` (lines 52-58):
  ```javascript
  if (fetchedSettings && fetchedSettings.discountPercent > 0) {
    const dItems = fetchedSettings.discountItems || ['all'];
    if (dItems.includes('all') || dItems.includes(doc.id)) {
      activePrice = data.price * (1 - (fetchedSettings.discountPercent / 100));
      hasDiscount = true;
    }
  }
  ```
- The output of the command `npm run build` completed successfully:
  ```
  vite v5.4.21 building for production...
  ✓ 1862 modules transformed.
  dist/assets/app-B5clcIYb.css   35.35 kB │ gzip:   6.80 kB
  dist/assets/app-BtfGtJyp.js   835.32 kB │ gzip: 211.75 kB
  ✓ built in 26.73s
  ```

---

## 2. Logic Chain
- **Step 1 (Negative and Non-Numeric Capacity inputs)**: In `Settings.jsx:287`, `settings.maxCapacityPerHour` is parsed to a Number. If the input is negative (`-10`) or non-numeric (`"abc"`), the condition `isNaN(maxCapacity) || maxCapacity < 0` (line 288) evaluates to `true`. This alerts the user and prevents the settings from being saved.
- **Step 2 (Empty Capacity Input)**: If the input is empty (`""`), `Number("")` evaluates to `0`. The validation check does not catch it because `0` is neither `NaN` nor `< 0`. Thus, `0` is saved as the `maxCapacityPerHour` in Firestore.
- **Step 3 (Discount & Tax validation)**: The change handler `handleChange` puts the raw string value in state. In `handleSave`, there is no validation or numeric conversion for `discountPercent` or `taxPercent`. Hence, if a user bypasses HTML constraints (such as via Developer Tools or intercepting requests), they can save an invalid percentage like `150`% or `-10`%.
- **Step 4 (Negative Prices in Customer Menu)**: Since `MenuOrder.jsx:55` calculates the active price using `data.price * (1 - (fetchedSettings.discountPercent / 100))`, a `discountPercent` of `150` evaluates to `price * -0.5`, leading to negative prices for items in the customer facing interface.
- **Step 5 (Legacy Compatibility)**: In `Settings.jsx:53-62`, if the newer field `bookingMode` is not found, the legacy booleans `bookingEnabled` and `requirePreOrderForBooking` are parsed to fall back correctly. During `handleChange` (line 100-118) and `handleSave`, both `bookingMode` and the legacy booleans are saved in Firestore, preserving full backward compatibility for older files like `Book.jsx` that still query `bookingEnabled`.
- **Step 6 (Capacity Enforcement)**: In `Book.jsx`, the database query does not count existing reservations for a slot nor does it check them against `settings.maxCapacityPerHour`. Thus, the limit is never enforced.

---

## 3. Caveats
- Firebase client-side security rules were not simulated.
- No other potential schema overrides were verified outside the specified settings fields.

---

## 4. Conclusion
- The build is stable and compiles successfully.
- Validation for `maxCapacityPerHour` correctly blocks negative and non-numeric inputs, but allows empty inputs to be saved as `0`.
- The system has high compatibility with legacy data as it safely reads old booleans and saves both legacy fields and new mode schemas.
- A critical logic bug exists where other settings fields like `discountPercent` and `taxPercent` are not validated during save, which can lead to negative item prices.
- The `maxCapacityPerHour` constraint is not enforced during public booking creation.

---

## 5. Verification Method
1. Inspect the code in `src/pages/admin/Settings.jsx` to verify that `handleSave()` lacks validation check blocks for `settings.discountPercent` and `settings.taxPercent`.
2. Inspect `src/pages/public/MenuOrder.jsx` to see the price formula: `activePrice = data.price * (1 - (fetchedSettings.discountPercent / 100))`.
3. Check `src/pages/public/Book.jsx` to verify that `maxCapacityPerHour` is never imported, checked, or compared.
4. Verify the build command: `npm run build` executes without errors.
