# Milestone 2 - Capacity & Booking Flow Analysis

## 1. Executive Summary
This report analyzes `src/pages/public/Book.jsx` and `src/pages/public/Checkout.jsx` to implement three booking system modes, custom 5-character alphanumeric Reservation IDs, and hourly capacity limits checking for **Milestone 2 - Capacity & Booking Flow**. 

The existing codebase implements a basic reservation booking flow and pre-order checkout. However, it lacks:
- Configurable booking modes (disabled, optional pre-order, mandatory pre-order).
- Custom uppercase alphanumeric Reservation IDs used as Firestore document keys.
- Hourly capacity limits tracking based on overlapping time slots.

This report outlines the precise codebase locations, Firestore schema relationships, and a detailed implementation strategy to implement these features safely and robustly.

---

## 2. Codebase Entry Points & Existing Logic

### 2.1. `src/pages/public/Book.jsx`
- **Settings Fetching (Lines 48–62)**: Settings are fetched from the Firestore document `settings/master` during component mount.
- **Time Slot Generation (Lines 100–115)**: Generates 30-minute intervals between `operatingHoursOpen` and `operatingHoursClose`.
- **Time Slot Filtering (Lines 120–144)**: Filters out past time slots when booking for today (requires a 1-hour buffer).
- **Form Submission (Lines 146–172)**: Currently, if `requirePreOrderForBooking` is true, details are saved to `localStorage` under `pendingReservation` and the user is redirected to `/order`. If false, a reservation document is created using `addDoc` with an auto-generated Firestore ID, then a success view is rendered.
- **Reservation Details Search (Lines 174–208)**: Searches reservations by ID (doc ID) or by phone number, but filters specifically for `status === 'confirmed'`.

### 2.2. `src/pages/public/Checkout.jsx`
- **Pre-order Flag Detection (Line 24)**: `const isPreOrder = !!localStorage.getItem('pendingReservation');` identifies if the cart represents a booking pre-order.
- **Form Submission (Lines 55–154)**:
  - Generates a sequential order number via a Firestore transaction.
  - Saves order details to the `orders` collection (status is set to `'scheduled'` if it is a pre-order).
  - Handles reservation creation/linking:
    - If `pendingRes.id` exists, it calls `updateDoc` to link the order ID to the existing reservation.
    - If `pendingRes.id` does NOT exist, it calls `addDoc` to create a new reservation doc with a Firestore-generated ID.

### 2.3. Firestore Structure for Reservations
- **Collection**: `reservations`
- **Key Fields**:
  - `name` (String): Customer name.
  - `phone` (String): Customer contact.
  - `date` (String): ISO Date string `YYYY-MM-DD` (e.g., `"2026-06-12"`).
  - `time` (String): 12-hour formatted time slot (e.g., `"10:30 AM"`, `"01:00 PM"`).
  - `guests` (String): Number of guests (e.g., `"2"`, `"4"`). Must be parsed to integer.
  - `status` (String): `'pending' | 'confirmed' | 'completed' | 'cancelled'`.
  - `linkedOrderId` (String): Linked pre-order order number (e.g., `"001"`).

---

## 3. Detailed Strategy

### 3.1. Booking System Modes
The booking system is controlled by two fields inside the `settings/master` Firestore document: `bookingEnabled` (Boolean) and `requirePreOrderForBooking` (Boolean). This maps to three distinct modes:
1. **Disabled Mode** (`bookingEnabled === false`):
   - **Behavior**: Block access immediately when rendering `Book.jsx`.
   - **UI Prompt**: Show a centered blocked-entry page stating: **"Sorry, We are not taking Reservations Now!!"** instead of the generic "Reservations Closed" template.
2. **Optional Pre-ordering Mode** (`bookingEnabled === true` and `requirePreOrderForBooking === false`):
   - **Behavior**: Upon reservation submission, write the reservation directly to Firestore, then show a confirmation page featuring a prominent prompt: **"Want the food on your table when you arrive? Pre-order now and it will be ready exactly when you sit down!"** with a button redirecting them to `/order`.
3. **Mandatory Pre-ordering Mode** (`bookingEnabled === true` and `requirePreOrderForBooking === true`):
   - **Behavior**: On form submit, generate the 5-character custom Reservation ID, store the details (including the generated ID) in `localStorage` under `pendingReservation`, and immediately redirect the user to `/order` without writing to Firestore.

---

### 3.2. Custom Reservation ID Generation & Lifecycle

To ensure a custom Reservation ID is generated at submission and propagates properly:
1. **ID Generator Function**: A helper function in `Book.jsx` that generates a random 5-character uppercase alphanumeric string:
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
2. **Book.jsx Integration**:
   - In `handleSubmit`, generate a new ID: `const resId = generateReservationId();`.
   - In **Optional Pre-ordering**, write the document using `setDoc(doc(db, 'reservations', resId), { ...formData, id: resId, status: 'pending', timestamp: serverTimestamp() })`.
   - In **Mandatory Pre-ordering**, store the generated ID in `localStorage`:
     ```javascript
     localStorage.setItem('pendingReservation', JSON.stringify({ ...formData, id: resId }));
     ```
   - On the booking confirmation screen, display `resId` as the **Reservation ID** prominently in the receipt card and the printable view.
3. **Checkout.jsx Integration**:
   - In `handleSubmit`, retrieve the `pendingReservation` from `localStorage`.
   - Instead of checking `pendingRes.id` and calling `addDoc` (which creates a random Firestore ID), verify if the document exists in Firestore first:
     ```javascript
     const resDocRef = doc(db, 'reservations', pendingRes.id);
     const resDocSnap = await getDoc(resDocRef);
     if (resDocSnap.exists()) {
       // Optional pre-order flow: reservation document already exists
       await updateDoc(resDocRef, { linkedOrderId: orderNumber });
     } else {
       // Mandatory pre-order flow: reservation document does not exist yet
       await setDoc(resDocRef, {
         ...pendingRes,
         linkedOrderId: orderNumber,
         status: 'pending',
         timestamp: serverTimestamp()
       });
     }
     ```
   - This guarantees that the generated 5-character ID acts as the primary key for the Firestore reservation document under all modes.

---

### 3.3. Hourly Capacity Limits Checking

Capacity limits are defined by `settings.maxCapacityPerHour` (retrieved from `settings/master`, defaulting to 30).
1. **Time Parser**: We must parse the 12-hour AM/PM string into minutes from midnight to allow simple mathematical comparison:
   ```javascript
   const parseTimeToMinutes = (timeStr) => {
     if (!timeStr) return 0;
     const cleanStr = timeStr.replace(/\u00a0/g, ' '); // Replace non-breaking spaces
     const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
     if (!match) return 0;
     let hours = parseInt(match[1], 10);
     const minutes = parseInt(match[2], 10);
     const ampm = match[3].toUpperCase();
     if (ampm === 'PM' && hours !== 12) hours += 12;
     if (ampm === 'AM' && hours === 12) hours = 0;
     return hours * 60 + minutes;
   };
   ```
2. **Overlap Condition**: Two slots overlap if the absolute difference between their start times is strictly less than 60 minutes:
   ```javascript
   Math.abs(selectedMinutes - reservationMinutes) < 60
   ```
3. **Fetching Confirmed Bookings**:
   - Add a state array `confirmedReservations` and a loader `loadingReservations` in `Book.jsx`.
   - Trigger a Firestore query inside a `useEffect` hook listening to changes in `formData.date`:
     ```javascript
     const q = query(
       collection(db, 'reservations'),
       where('date', '==', formData.date),
       where('status', '==', 'confirmed')
     );
     ```
4. **Dynamic UI Dropdown Disabling**:
   - Calculate overlapping guests for each slot in the dropdown:
     ```javascript
     const getOverlapGuests = (slot, reservations) => {
       const slotMin = parseTimeToMinutes(slot);
       return reservations.reduce((sum, res) => {
         const resMin = parseTimeToMinutes(res.time);
         return Math.abs(slotMin - resMin) < 60 ? sum + (parseInt(res.guests, 10) || 0) : sum;
       }, 0);
     };
     ```
   - Mark a slot disabled if:
     ```javascript
     const overlapGuests = getOverlapGuests(slot, confirmedReservations);
     const isOverCap = (overlapGuests + parseInt(formData.guests, 10)) > (settings.maxCapacityPerHour || 30);
     ```
   - Render each `<option>` as:
     ```javascript
     <option key={i} value={slot} disabled={isOverCap}>
       {slot} {isOverCap ? ' (Full)' : ` (${(settings.maxCapacityPerHour || 30) - overlapGuests} left)`}
     </option>
     ```
5. **Form Submission Re-checking**:
   - In `Book.jsx` `handleSubmit`, execute a fresh Firestore query for confirmed bookings on the selected date to prevent concurrency race conditions.
   - If the sum of overlapping guests + requested guests exceeds capacity, block submission, display an alert message with the remaining capacity details, and reset processing state.

---

## 4. Proposed Code Modifications (Diff Sketches)

### 4.1. `src/pages/public/Book.jsx`

#### Imports Update
```javascript
// Add setDoc to the firebase/firestore imports
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
```

#### Helper Functions Addition (Placed above the `Book` component definition)
```javascript
const generateReservationId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const cleanStr = timeStr.replace(/\u00a0/g, ' ');
  const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};
```

#### Reservation Fetching Hooks (Inside the `Book` component)
```javascript
const [confirmedReservations, setConfirmedReservations] = useState([]);
const [loadingReservations, setLoadingReservations] = useState(false);

useEffect(() => {
  if (!formData.date) {
    setConfirmedReservations([]);
    return;
  }
  const fetchReservationsForDate = async () => {
    setLoadingReservations(true);
    try {
      const q = query(
        collection(db, 'reservations'),
        where('date', '==', formData.date),
        where('status', '==', 'confirmed')
      );
      const snap = await getDocs(q);
      setConfirmedReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReservations(false);
    }
  };
  fetchReservationsForDate();
}, [formData.date]);
```

#### Form Submit Overhaul (`handleSubmit` in `Book.jsx`)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.time) return alert("Please select a valid time.");

  setProcessing(true);
  try {
    // 1. Fresh database check
    const q = query(
      collection(db, 'reservations'),
      where('date', '==', formData.date),
      where('status', '==', 'confirmed')
    );
    const snap = await getDocs(q);
    const freshReservations = snap.docs.map(d => d.data());

    // 2. Capacity validation
    const slotMin = parseTimeToMinutes(formData.time);
    let overlapGuests = 0;
    freshReservations.forEach(res => {
      const resMin = parseTimeToMinutes(res.time);
      if (Math.abs(slotMin - resMin) < 60) {
        overlapGuests += parseInt(res.guests, 10) || 0;
      }
    });

    const maxCap = settings.maxCapacityPerHour || 30;
    const requestedGuests = parseInt(formData.guests, 10) || 2;

    if (overlapGuests + requestedGuests > maxCap) {
      alert(`Sorry, this time slot is over capacity. Available seats: ${maxCap - overlapGuests}.`);
      setProcessing(false);
      return;
    }

    // 3. Custom ID Generation
    const resId = generateReservationId();

    // 4. Handle Modes
    if (settings.requirePreOrderForBooking) {
      localStorage.setItem('pendingReservation', JSON.stringify({
        ...formData,
        id: resId
      }));
      navigate('/order');
      return;
    }

    await setDoc(doc(db, 'reservations', resId), {
      ...formData,
      id: resId,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    setCreatedResId(resId);
    setSuccess(true);
  } catch (error) {
    console.error(error);
    alert("Failed to submit reservation.");
  } finally {
    setProcessing(false);
  }
};
```

---

### 4.2. `src/pages/public/Checkout.jsx`

#### Pre-order Complete Overhaul (`handleSubmit` in `Checkout.jsx`)
```javascript
      // 3. Create or Update Reservation if pending
      let reservationDetails = null;
      if (pendingResStr) {
        try {
          const pendingRes = JSON.parse(pendingResStr);
          reservationDetails = pendingRes;
          
          if (pendingRes.id) {
            const resDocRef = doc(db, 'reservations', pendingRes.id);
            const resDocSnap = await getDoc(resDocRef);
            
            if (resDocSnap.exists()) {
              // Reservation was already created in Book.jsx (optional pre-order flow)
              await updateDoc(resDocRef, {
                linkedOrderId: orderNumber
              });
            } else {
              // Reservation was NOT created yet (required pre-order flow)
              await setDoc(resDocRef, {
                ...pendingRes,
                linkedOrderId: orderNumber,
                status: 'pending',
                timestamp: serverTimestamp()
              });
            }
          }
          localStorage.removeItem('pendingReservation');
        } catch (e) { 
          console.error("Error processing reservation", e); 
          localStorage.removeItem('pendingReservation');
        }
      }
```

---

## 5. Verification Plan

To verify this implementation, perform the following tests:
1. **Booking System Modes Verification**:
   - Update `settings/master` `bookingEnabled` to `false`. Load `/book`. Verify the page renders **"Sorry, We are not taking Reservations Now!!"** and blocks input.
   - Update `settings/master` `bookingEnabled` to `true` and `requirePreOrderForBooking` to `false` (optional). Submit a booking. Check that it successfully saves the reservation under a 5-character ID in Firestore and displays the pre-order prompt.
   - Update `settings/master` `requirePreOrderForBooking` to `true` (mandatory). Submit a booking. Verify it stores details in `localStorage` and redirects directly to `/order`. Complete checkout and verify a new Firestore reservation document is created under the custom 5-character ID.
2. **Custom ID Verification**:
   - Verify all newly created reservation documents use the 5-character uppercase alphanumeric ID as their document ID in Firestore.
   - Search the generated ID via the "Manage Booking" tab and verify it retrieves details successfully (once status is marked confirmed).
3. **Hourly Capacity Checking Verification**:
   - Set `maxCapacityPerHour` to 10 in settings.
   - Insert a confirmed reservation for Date X, Time 12:00 PM with 8 guests.
   - Load `/book` for Date X.
   - Choose guests = 4. Verify that slots from 11:01 AM to 12:59 PM (e.g. 11:30 AM, 12:00 PM, 12:30 PM) display as **(Full)** and are disabled in the dropdown because `8 + 4 = 12 > 10`.
   - Verify slots outside the overlap range (e.g. 11:00 AM and 1:00 PM) remain selectable.
   - Bypass UI disabled attributes and submit a booking of 4 guests for 12:00 PM. Confirm `handleSubmit` triggers the validation and rejects the submission with a clear error message.
