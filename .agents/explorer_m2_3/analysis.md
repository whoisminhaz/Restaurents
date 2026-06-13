# Milestone 2 - Capacity & Booking Flow Analysis

## 1. Observation
### File Locations & Existing Logic
- **`src/pages/public/Book.jsx`**:
  - Loads settings from `settings/master` document in Firestore (Line 50):
    ```javascript
    const snap = await getDoc(doc(db, 'settings', 'master'));
    ```
  - Displays "Reservations Closed" and blocks entry if `settings.bookingEnabled === false` (Line 244):
    ```javascript
    if (settings.bookingEnabled === false) {
      return (
        <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reservations Closed</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sorry, we are not taking orders or reservations right now.</p>
          ...
    ```
  - Submits reservation using `addDoc` on the `reservations` collection (Line 159):
    ```javascript
    const docRef = await addDoc(collection(db, 'reservations'), {
      ...formData,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    setCreatedResId(docRef.id);
    setSuccess(true);
    ```
  - Redirects to `/order` if `settings.requirePreOrderForBooking` is true (Line 150):
    ```javascript
    if (settings.requirePreOrderForBooking) {
      localStorage.setItem('pendingReservation', JSON.stringify(formData));
      navigate('/order');
      return;
    }
    ```
  - Displays optional pre-ordering promotion in success view when `requirePreOrderForBooking` is false (Line 286):
    ```javascript
    {!settings.requirePreOrderForBooking && (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl text-white shadow-xl shadow-orange-500/30 mb-4 animate-fade-in-up">
        ...
        <button 
          onClick={() => {
            localStorage.setItem('pendingReservation', JSON.stringify({ ...formData, id: createdResId }));
            navigate('/order');
          }}
          ...
    ```
- **`src/pages/public/Checkout.jsx`**:
  - Extracts pending reservation from `localStorage` under key `'pendingReservation'` (Line 16, 20, 24).
  - Handles preorder completion in `handleSubmit` (Line 121):
    ```javascript
    if (pendingResStr) {
      try {
        const pendingRes = JSON.parse(pendingResStr);
        reservationDetails = pendingRes;
        
        if (pendingRes.id) {
          // Reservation was already created in Book.jsx (optional pre-order flow)
          await updateDoc(doc(db, 'reservations', pendingRes.id), {
            linkedOrderId: orderNumber
          });
        } else {
          // Reservation was NOT created yet (required pre-order flow)
          await addDoc(collection(db, 'reservations'), {
            ...pendingRes,
            linkedOrderId: orderNumber,
            status: 'pending',
            timestamp: serverTimestamp()
          });
        }
        localStorage.removeItem('pendingReservation');
      } catch (e) { ... }
    }
    ```
- **`src/pages/admin/Settings.jsx`**:
  - Configures `bookingMode` which sets `bookingEnabled` and `requirePreOrderForBooking` in Firestore settings (Lines 42-43, 100-118):
    - `'disabled'` -> `bookingEnabled = false`, `requirePreOrderForBooking = false`
    - `'preorder'` -> `bookingEnabled = true`, `requirePreOrderForBooking = true`
    - `'enabled'`  -> `bookingEnabled = true`, `requirePreOrderForBooking = false`
  - Defines `maxCapacityPerHour` in setting state with a default value of `30` (Line 43).

---

## 2. Logic Chain & Implementation Strategy

### Part 1: Implement Three Booking System Modes in `Book.jsx`
1. **Disabled Mode**:
   - Condition: `settings.bookingEnabled === false` (equivalent to `bookingMode === 'disabled'`).
   - Action: Change the UI message in the blocking return block (Line 247-248) to show:
     `"Sorry, We are not taking Reservations Now!!"` as required.
2. **Optional Pre-ordering**:
   - Condition: `settings.requirePreOrderForBooking === false` (equivalent to `bookingMode === 'enabled'`).
   - Action: Retain the current flow where the reservation is created first on submit, then a receipt with a CTA to pre-order is shown.
3. **Mandatory Pre-ordering**:
   - Condition: `settings.requirePreOrderForBooking === true` (equivalent to `bookingMode === 'preorder'`).
   - Action: Save details with the generated Reservation ID to `localStorage` and redirect to `/order` immediately.

### Part 2: 5-Character Alphanumeric Reservation ID Generation
1. **Generator Utility**:
   Define a function in `Book.jsx` to generate 5 uppercase alphanumeric characters (e.g. `AK649`):
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
2. **Book.jsx - Integration**:
   - Generate this custom ID at the start of `handleSubmit`: `const customId = generateReservationId();`.
   - If mandatory pre-order, save it inside `localStorage.setItem('pendingReservation', JSON.stringify({ ...formData, id: customId }))`.
   - If optional pre-order/no pre-order, save it directly to Firestore using `setDoc` and path `doc(db, 'reservations', customId)` instead of `addDoc`. Set `createdResId` to `customId`.
   - Display the custom ID prominently in the confirmation receipt card and the hidden print receipt section.
3. **Checkout.jsx - Integration**:
   - In `Checkout.jsx`'s `handleSubmit`, read the `pendingRes.id` from `localStorage`.
   - Verify whether the reservation document already exists in Firestore using `getDoc`:
     ```javascript
     const resDocRef = doc(db, 'reservations', pendingRes.id);
     const resDocSnap = await getDoc(resDocRef);
     ```
   - If it exists (optional flow), update `linkedOrderId` with `updateDoc`.
   - If it does not exist (mandatory flow), create the document under ID `pendingRes.id` with `setDoc(resDocRef, { ...pendingRes, linkedOrderId: orderNumber, status: 'pending', timestamp: serverTimestamp() })`.
   - Display the Reservation ID prominently on the checkout success receipt screen and printable receipt.

### Part 3: Hourly Capacity Limits Checking
1. **Querying Confirmed Reservations**:
   Add a state `confirmedReservations` in `Book.jsx` and load it via `useEffect` whenever `formData.date` changes:
   ```javascript
   useEffect(() => {
     if (!formData.date) {
       setConfirmedReservations([]);
       return;
     }
     const fetchConfirmed = async () => {
       try {
         const q = query(
           collection(db, 'reservations'),
           where('date', '==', formData.date),
           where('status', '==', 'confirmed')
         );
         const snap = await getDocs(q);
         setConfirmedReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
       } catch (err) {
         console.error("Error fetching confirmed reservations:", err);
       }
     };
     fetchConfirmed();
   }, [formData.date]);
   ```
2. **Time Parsing and Overlap Definition**:
   Implement a time parser in `Book.jsx` converting times (e.g., `'12:30 PM'`) to minutes from midnight:
   ```javascript
   const parseTimeToMinutes = (timeStr) => {
     if (!timeStr) return 0;
     const parts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
     if (!parts) return 0;
     let hours = parseInt(parts[1], 10);
     const minutes = parseInt(parts[2], 10);
     const ampm = parts[3].toUpperCase();
     if (ampm === 'PM' && hours !== 12) hours += 12;
     if (ampm === 'AM' && hours === 12) hours = 0;
     return hours * 60 + minutes;
   };
   ```
   Overlap exists if the difference between a confirmed reservation time and the selected slot is less than 60 minutes:
   ```javascript
   const getConfirmedGuestsForSlot = (slotTimeStr, reservationsList) => {
     const slotMinutes = parseTimeToMinutes(slotTimeStr);
     return reservationsList
       .filter(res => {
         const resMinutes = parseTimeToMinutes(res.time);
         return Math.abs(slotMinutes - resMinutes) < 60;
       })
       .reduce((sum, res) => sum + parseInt(res.guests || 0, 10), 0);
   };
   ```
3. **Capacity Validation**:
   Check if the slot is full:
   ```javascript
   const isSlotFull = (slotTimeStr, reservationsList = confirmedReservations) => {
     const confirmedGuests = getConfirmedGuestsForSlot(slotTimeStr, reservationsList);
     const requestedGuests = parseInt(formData.guests || 2, 10);
     const maxCapacity = parseInt(settings?.maxCapacityPerHour || 30, 10);
     return (confirmedGuests + requestedGuests) > maxCapacity;
   };
   ```
4. **Disable Slots in UI**:
   In the time dropdown select option, disable any full slots:
   ```javascript
   {timeSlots.map((slot, i) => {
     const full = isSlotFull(slot);
     return (
       <option key={i} value={slot} disabled={full}>
         {slot}{full ? " (Full)" : ""}
       </option>
     );
   })}
   ```
5. **Enforce on Submission in `handleSubmit`**:
   Before proceeding, re-query the database to avoid race conditions and reject submission if capacity is exceeded:
   ```javascript
   let latestConfirmed = [];
   const q = query(
     collection(db, 'reservations'),
     where('date', '==', formData.date),
     where('status', '==', 'confirmed')
   );
   const snap = await getDocs(q);
   latestConfirmed = snap.docs.map(d => ({ id: d.id, ...d.data() }));

   if (isSlotFull(formData.time, latestConfirmed)) {
     alert("Sorry, this time slot is no longer available (capacity exceeded). Please select another time or date.");
     return;
   }
   ```

---

## 3. Caveats
- If the owner changes the `maxCapacityPerHour` in settings while a user is booking, it will update reactively upon next settings fetch.
- If a reservation is pending, its guests are not counted towards capacity since the requirement is to query `'confirmed'` reservations only.
- In mandatory pre-ordering, there is a small window between submitting the booking details in `Book.jsx` and completing payment in `Checkout.jsx`. If someone else confirms a reservation that saturates capacity during this time, the order might complete but the reservation would violate the capacity limit. A final validation in `Checkout.jsx` prior to writing the order and reservation could be added to mitigate this.

---

## 4. Conclusion
The proposed implementation strategy fully covers the milestone objectives for booking modes, custom ID lifecycle tracking across checkout, and hourly capacity constraint validation. It ensures data consistency and handles race conditions safely.

---

## 5. Verification Method
- **Verify UI Disable Logic**: Select a date, configure maxCapacity in Firestore Settings, add confirmed reservations such that a slot is full, and confirm that the slot is disabled and labeled "(Full)" in the Book.jsx dropdown.
- **Verify Submit Enforcement**: Force-select a disabled option or simulate concurrent submissions to ensure `handleSubmit` blocks reservation creation.
- **Verify ID Generation & Checkout Lifecycle**: Generate a custom ID, ensure it maps to the document name in Firestore, complete the checkout flow for both optional and mandatory pre-ordering, and check that the Reservation ID remains unchanged and is associated with the `linkedOrderId`.
