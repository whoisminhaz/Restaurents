# Analysis - Booking Mode & Capacity Integration

## Summary of Findings
We analyzed the reservation (`Book.jsx`) and checkout (`Checkout.jsx`) workflows to transition settings control to a unified `bookingMode` field (`disabled`, `enabled-no-preorder`, `enabled-mandatory-preorder`) and implement a dynamic capacity checker based on hourly overlapping bookings. We formulated an implementation plan using custom alphanumeric reservation IDs to unify both the optional and mandatory pre-ordering routes securely.

---

## 1. Current Code Analysis

### A. Reservation Flow (`src/pages/public/Book.jsx`)
- **Settings Fetching**: Fetched on mount via `getDoc(doc(db, 'settings', 'master'))` (Lines 47–62).
- **Disabled Block**: Currently checks `settings.bookingEnabled === false` (Lines 244–257) and displays a "Reservations Closed" screen.
- **Routing Decision**: In `handleSubmit` (Lines 146–172):
  - If `settings.requirePreOrderForBooking` is `true`, the form data is saved into `localStorage.setItem('pendingReservation', JSON.stringify(formData))` and the user is redirected to `/order`.
  - If `false`, the reservation is written to Firestore using `addDoc(collection(db, 'reservations'), ...)` and the generated document ID is stored in `createdResId` (stored in state).
- **Optional Pre-ordering Link**: If the reservation was created directly in `Book.jsx`, the success screen displays a banner: *"Want the food on your table when you arrive?"* (Lines 286–300). Clicking this saves the reservation data (including the `id: createdResId`) to `localStorage` and routes to `/order`.

### B. Checkout Flow (`src/pages/public/Checkout.jsx`)
- **Reservation Retrieval**: Looks for a `pendingReservation` key in `localStorage` on line 24.
- **Deduplication / Creation**: In `handleSubmit` (Lines 119–146):
  - If `pendingRes.id` is present (optional flow, reservation already exists in database), it updates the existing reservation with the `linkedOrderId` via `updateDoc`.
  - If `pendingRes.id` is not present (mandatory flow, reservation does not yet exist), it creates a new reservation document using `addDoc(collection(db, 'reservations'), ...)`.

---

## 2. Proposed Implementation Details

### A. Unified `bookingMode` & Blocking View
Replace `bookingEnabled` and `requirePreOrderForBooking` with a single Firestore setting `bookingMode` taking values:
1. `'disabled'`
2. `'enabled-no-preorder'`
3. `'enabled-mandatory-preorder'`

#### UI Block in `Book.jsx`:
```javascript
if (settings.bookingMode === 'disabled') {
  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reservations Closed</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Sorry, We are not taking Reservations Now!!</p>
      <button 
        onClick={() => navigate('/')}
        className="py-3 px-8 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        Return to Home
      </button>
    </div>
  );
}
```

---

### B. Custom Reservation ID Generator
Create a 5-character uppercase alphanumeric ID generator to use as the document ID for reservations:
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

---

### C. Capacity Tracking & Slot Disabling

#### 1. Time Slot to Minutes Helper
Parse the 12-hour AM/PM string (e.g. `"06:30 PM"`) into minutes from midnight:
```javascript
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};
```

#### 2. Querying Confirmed Bookings
In `Book.jsx`, add a state variable and an effect to fetch confirmed reservations for the selected date:
```javascript
const [confirmedReservations, setConfirmedReservations] = useState([]);

useEffect(() => {
  if (!formData.date) return;
  const fetchConfirmedReservations = async () => {
    try {
      const q = query(
        collection(db, 'reservations'),
        where('date', '==', formData.date),
        where('status', '==', 'confirmed')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => doc.data());
      setConfirmedReservations(list);
    } catch (err) {
      console.error("Error fetching confirmed reservations: ", err);
    }
  };
  fetchConfirmedReservations();
}, [formData.date]);
```

#### 3. Overlap & Capacity Calculation
Since bookings represent exactly 60 minutes of table time, a reservation overlaps with a slot if:
$$\Delta = |T_{\text{res}} - T_{\text{slot}}| < 60 \text{ minutes}$$

We define the current overlap guest count for a slot as:
```javascript
const getSlotOverlapCapacity = (slotTime, reservationsList) => {
  const slotMin = timeToMinutes(slotTime);
  return reservationsList
    .filter(res => Math.abs(timeToMinutes(res.time) - slotMin) < 60)
    .reduce((sum, res) => sum + parseInt(res.guests || 0, 10), 0);
};
```

#### 4. UI Slot Disabling
In the rendering of the select element in `Book.jsx`:
```jsx
{timeSlots.map((slot, i) => {
  const currentOverlap = getSlotOverlapCapacity(slot, confirmedReservations);
  const limit = settings.maxCapacityPerHour ? parseInt(settings.maxCapacityPerHour, 10) : 30;
  const isFull = currentOverlap + parseInt(formData.guests, 10) > limit;

  return (
    <option key={i} value={slot} disabled={isFull}>
      {slot} {isFull ? `(Full - Space: ${Math.max(0, limit - currentOverlap)})` : ''}
    </option>
  );
})}
```

---

### D. Submission & Re-Verification

#### 1. Form Submission in `Book.jsx`
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.time) return alert("Please select a valid time.");

  setProcessing(true);
  try {
    // 1. Fetch fresh capacity data to prevent race conditions
    const q = query(
      collection(db, 'reservations'),
      where('date', '==', formData.date),
      where('status', '==', 'confirmed')
    );
    const snap = await getDocs(q);
    const freshConfirmed = snap.docs.map(doc => doc.data());

    // 2. Recalculate capacity
    const slotMin = timeToMinutes(formData.time);
    const currentOverlapGuests = freshConfirmed
      .filter(res => Math.abs(timeToMinutes(res.time) - slotMin) < 60)
      .reduce((sum, res) => sum + parseInt(res.guests || 0, 10), 0);

    const limit = settings.maxCapacityPerHour ? parseInt(settings.maxCapacityPerHour, 10) : 30;
    if (currentOverlapGuests + parseInt(formData.guests, 10) > limit) {
      alert(`Sorry, the selected time slot has exceeded its capacity. Remaining capacity for this slot is ${Math.max(0, limit - currentOverlapGuests)} guests. Please select another time or reduce guest count.`);
      setProcessing(false);
      return;
    }

    // 3. Generate the 5-character uppercase reservation ID
    const customId = generateReservationId();
    const pendingRes = { ...formData, id: customId };

    // 4. Handle Routing based on Booking Mode
    if (settings.bookingMode === 'enabled-mandatory-preorder') {
      localStorage.setItem('pendingReservation', JSON.stringify(pendingRes));
      navigate('/order');
      return;
    }

    // Optional pre-order flow: save to Firestore immediately using setDoc
    await setDoc(doc(db, 'reservations', customId), {
      ...formData,
      id: customId,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    
    setCreatedResId(customId);
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

### E. Checkout Integration (`Checkout.jsx`)
In `Checkout.jsx`, we retrieve `pendingReservation` from `localStorage`. Since we now generate the custom ID in `Book.jsx` for both mandatory and optional flows, `pendingRes.id` will always be present in the storage object.

We replace the Firestore handling block (Lines 119–146) with:
```javascript
      // 3. Create or Update Reservation if pending
      let reservationDetails = null;
      if (pendingResStr) {
        try {
          const pendingRes = JSON.parse(pendingResStr);
          reservationDetails = pendingRes;
          
          if (pendingRes.id) {
            const resRef = doc(db, 'reservations', pendingRes.id);
            const resSnap = await getDoc(resRef);
            
            if (resSnap.exists()) {
              // Optional pre-order flow: reservation already created, update link to order
              await updateDoc(resRef, {
                linkedOrderId: orderNumber
              });
            } else {
              // Mandatory pre-order flow: reservation does not exist yet, create with custom ID
              await setDoc(resRef, {
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
This design successfully resolves both reservation creation and order linkage seamlessly.
