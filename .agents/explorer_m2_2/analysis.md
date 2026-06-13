# Milestone 2 - Capacity & Booking Flow Analysis

## Executive Summary
This report analyzes the existing booking flow in `src/pages/public/Book.jsx` and checkout logic in `src/pages/public/Checkout.jsx` to implement three booking system modes, custom 5-character alphanumeric Reservation IDs, and hourly capacity limit checks. We also identify a critical E2E testing framework issue and propose a zero-code-change solution.

---

## 1. Booking System Modes in `Book.jsx`
The three booking system modes are controlled by the `bookingMode` ('disabled' | 'preorder' | 'enabled'), which maps to `bookingEnabled` (boolean) and `requirePreOrderForBooking` (boolean) in `settings/master` Firestore document.

### Current Implementation Location:
- **Fetch Settings**: Settings are loaded from Firestore `settings/master` (lines 48-62) and stored in state `settings`.
- **Disabled Check**: In lines 244-257, if `settings.bookingEnabled === false`, the page displays "Reservations Closed".
- **Submission Flow**: In lines 150-155, if `settings.requirePreOrderForBooking` is true (mandatory pre-order), it redirects to `/order`. Otherwise, it submits the reservation directly (optional pre-order).

### Recommended Implementation Strategy:
1. **Disabled Mode**:
   Modify the early return condition (lines 244-257). If `settings.bookingEnabled === false` or `settings.bookingMode === 'disabled'`, block entry and show the exact text:
   `"Sorry, We are not taking Reservations Now!!"` as the header or main message.
2. **Optional Pre-ordering Mode**:
   - This mode is active when `settings.bookingEnabled === true && settings.requirePreOrderForBooking === false`.
   - On submitting the booking form, create the Firestore reservation immediately, generating the custom ID, and transition to the `success` screen.
   - On the `success` screen, show a prominent prompt asking: *"Want the food on your table when you arrive? Pre-order now..."*
   - Clicking *"Yes, I want to Pre-Order!"* will save the pending reservation details, **including the created Reservation ID (`id`)**, to `localStorage.setItem('pendingReservation', ...)` and redirect to `/order`.
3. **Mandatory Pre-ordering Mode**:
   - This mode is active when `settings.bookingEnabled === true && settings.requirePreOrderForBooking === true`.
   - On submitting the booking form, **generate the custom Reservation ID (`id`)**, combine it with `formData`, save it to `localStorage.setItem('pendingReservation', ...)` and immediately redirect to `/order` without writing to Firestore yet.

---

## 2. Alphanumeric Reservation ID Generation & Integration
Currently, Firebase auto-generates document IDs using `addDoc` (e.g. standard 20-character Firestore IDs). Milestone 2 requires 5-character random uppercase alphanumeric IDs (e.g., `"AK649"`).

### ID Generation Code:
```javascript
const generateReservationId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
```

### Strategy for Firestore Integration:
- **`Book.jsx` (Optional/No Pre-order Flow)**:
  Replace `addDoc(collection(db, 'reservations'), ...)` with `setDoc(doc(db, 'reservations', customId), ...)` to write the document using the custom ID.
- **`Book.jsx` (Mandatory Flow)**:
  Generate the custom ID on submission, append it to the `formData` object as `id`, and save it to `localStorage` under `pendingReservation`.
- **`Checkout.jsx` (Order Completion)**:
  Modify the reservation creation/update step (lines 119-146):
  ```javascript
  const pendingRes = JSON.parse(pendingResStr);
  if (pendingRes.id) {
    const resDocRef = doc(db, 'reservations', pendingRes.id);
    const resDocSnap = await getDoc(resDocRef);
    const { id, ...resData } = pendingRes;
    
    if (resDocSnap.exists()) {
      // Optional Flow: Reservation document already exists, update linkedOrderId
      await updateDoc(resDocRef, {
        linkedOrderId: orderNumber
      });
    } else {
      // Mandatory Flow: Reservation document doesn't exist yet, create it using setDoc
      await setDoc(resDocRef, {
        ...resData,
        linkedOrderId: orderNumber,
        status: 'pending',
        timestamp: serverTimestamp()
      });
    }
  }
  ```

### Strategy for UI Confirmation & Receipts:
- **Confirmation Screen (`Book.jsx` lines 263-284)**: Display the `createdResId` prominently.
- **Printable Receipt (`Book.jsx` lines 320-348)**: Display `createdResId` as "Reservation ID".
- **Checkout Success Receipt (`Checkout.jsx` lines 165-220 & print view)**: Check if `successData.reservation` exists, and display `successData.reservation.id`.

---

## 3. Hourly Capacity Limits Checking

### Time Parsing Logic:
Since reservation times are 12-hour formatted strings like `"10:30 AM"` or `"07:00 PM"`, we must parse them into minutes from midnight (0 to 1439) for mathematical comparison.
```javascript
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (parts) {
    let hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    const ampm = parts[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  // Fallback for 24h format "14:00"
  const parts24 = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (parts24) {
    const hours = parseInt(parts24[1], 10);
    const minutes = parseInt(parts24[2], 10);
    return hours * 60 + minutes;
  }
  return 0;
};
```

### Overlap Verification Formula:
A reservation starting at `resTime` overlaps with `slotTime` if they are within less than 60 minutes of each other:
$$\Delta t = | \text{parseTimeToMinutes(slotTime)} - \text{parseTimeToMinutes(resTime)} | < 60$$

### Firestore Query Design:
When `formData.date` is selected or updated:
```javascript
const q = query(
  collection(db, 'reservations'),
  where('date', '==', formData.date),
  where('status', '==', 'confirmed')
);
const snap = await getDocs(q);
const confirmedReservations = snap.docs.map(doc => doc.data());
```

### Guest Capacity Calculation:
For a candidate time slot `slotTime`:
1. Filter the retrieved confirmed reservations where the start time is within $< 60$ minutes of the slot.
2. Sum the `guests` field (converted to numbers) for all overlapping reservations.
3. If $\text{sum(guests)} + \text{requested\_guests} > \text{maxCapacityPerHour}$ (where `maxCapacityPerHour` defaults to 30), the slot is over capacity.

### UI Integration in `Book.jsx`:
- During rendering of `<select name="time">` options, calculate capacity for each generated slot using `formData.guests`.
- If a slot is over capacity, mark it as `disabled` and append `(FULL)` to its text.

### Submission Check in `handleSubmit`:
To avoid race conditions:
1. Re-query Firestore for latest confirmed reservations on `formData.date`.
2. Re-calculate capacity for `formData.time`.
3. If exceeded, block submission, display an alert message, and reset processing.

---

## 4. E2E Test Suite 404 Issue & Verification
### Observation:
When executing `node tests/e2e/run-tests.js`, Puppeteer tests fail with 404 errors when visiting `http://localhost:5173/`. 
Vite's dev server by default serves `index.html` at the root `/`. Because the main entry file in this project is named `app.html` (in the root directory) and there is no root-level `index.html`, Vite returns a 404.

### Proposed Solution:
To enable tests to pass without modifying index configurations, a Vite dev server rewrite middleware should be added to `vite.e2e.config.js`. This plugin intercepts root requests `/` and rewrites them to `/app.html`:
```javascript
// Add to vite.e2e.config.js plugins list:
{
  name: 'html-redirect-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/') {
        req.url = '/app.html';
      }
      next();
    });
  }
}
```
