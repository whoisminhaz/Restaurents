# Explorer 1 Handoff Report

## 1. Observation
I observed the following files, configurations, and build logs:

1.  **Firestore Settings & Configurations (`src/config/firebase.js`)**:
    *   Imports and exports authentication, database, and storage helpers:
        ```javascript
        export { auth, db, storage };
        ```
2.  **Booking Storage & Flow (`src/pages/public/Book.jsx`)**:
    *   Creates a new reservation under the `reservations` collection:
        ```javascript
        const docRef = await addDoc(collection(db, 'reservations'), {
          ...formData,
          status: 'pending',
          timestamp: serverTimestamp()
        });
        ```
    *   If pre-ordering is required, it saves to `localStorage`:
        ```javascript
        if (settings.requirePreOrderForBooking) {
          localStorage.setItem('pendingReservation', JSON.stringify(formData));
          navigate('/order');
          return;
        }
        ```
    *   Retrieves reservations by ID or phone number and updates status to `'cancelled'`:
        ```javascript
        const resDoc = await getDoc(doc(db, 'reservations', searchVal));
        ...
        await updateDoc(doc(db, 'reservations', foundRes.id), {
          status: 'cancelled'
        });
        ```
3.  **Settings Storage (`src/pages/admin/Settings.jsx`)**:
    *   Uses Firestore collection `settings` documents `master` (restaurant metadata, scheduling, operating rules) and `adminConfig` (allowed emails for employee access control):
        ```javascript
        const docRef = doc(db, 'settings', 'master');
        ...
        const adminDocRef = doc(db, 'settings', 'adminConfig');
        ```
4.  **Live Orders & Alert Routing (`src/pages/admin/LiveOrders.jsx`)**:
    *   Groups pending orders and alerts. Upcoming reservations with arrival times within 60 minutes are placed in the `pending` list:
        ```javascript
        const upcomingReservations = reservations.filter(r => {
          if (r.status !== 'confirmed' || r.alertSent || !r.date || !r.time) return false;
          if (r.linkedOrderId) return false;
          const arrival = new Date(`${r.date}T${r.time}`);
          const diffMinutes = (arrival - currentTime) / (1000 * 60);
          return diffMinutes > 0 && diffMinutes <= 60;
        });
        ```
    *   If an order is moved to kitchen (status: `'processing'`) and there is a telegram webhook:
        ```javascript
        if (newStatus === 'processing' && settings?.telegramWebhook && orderData) { ... }
        ```
5.  **Reservations Board (`src/pages/admin/Reservations.jsx`)**:
    *   Allows confirming and table assignment, with cascading updates to orders:
        ```javascript
        if (status === 'confirmed' && linkedOrderId && selectedTable) {
          const orderQ = query(collection(db, 'orders'), where('orderNumber', '==', linkedOrderId));
          const orderSnaps = await getDocs(orderQ);
          for (const orderDoc of orderSnaps.docs) {
            await updateDoc(doc(db, 'orders', orderDoc.id), { table: selectedTable });
          }
        }
        ```
6.  **Firestore Security Rules (`firestore.rules`)**:
    *   Reservations write/read rules restrict read/update/delete to authorized admins only:
        ```javascript
        match /reservations/{document=**} {
          allow create: if true;
          allow read, update, delete: if isAuthorized();
        }
        ```
7.  **Tests & Build (`package.json`, `vite.config.js`)**:
    *   Vite builds the project using `app.html` as the rollup entry point.
    *   `package.json` scripts:
        ```json
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        }
        ```
    *   No test files or testing configuration exist in the directory.
    *   Build command `npm run build` ran successfully, outputting compiled files to `dist/`.

---

## 2. Logic Chain
1.  **Booking Storage & Flow**: Comparing the public booking flow (`Book.jsx`) and checkout flow (`Checkout.jsx`), we see that reservations are written to Firestore (`reservations` collection), but are temporarily staged in `localStorage` under `pendingReservation` if a pre-order is in progress.
2.  **Settings**: Examining `Settings.jsx` shows settings are retrieved/saved to Firestore under `settings/master` and `settings/adminConfig`.
3.  **CRM Board & Routing**: Examining `LiveOrders.jsx` and `Reservations.jsx` shows that orders and reservations are loaded reactively via Firestore `onSnapshot`. Orders are categorized by status tabs, and reservations are categorized by scheduling views. Table updates cascade to orders via matching `linkedOrderId` with `orderNumber`. Telegram webhook alerts are fired on kitchen transfer or manually for upcoming reservations.
4.  **Critical Security Mismatch**: We observed in `firestore.rules` that only users satisfying `isAuthorized()` can read or update reservations. However, we also observed that `Book.jsx` (which is public-facing and unauthenticated) queries the `/reservations` collection by phone number and makes updates to set the reservation status to `'cancelled'`. Thus, the rules will block public users from viewing or cancelling bookings, throwing a permission error.
5.  **Tests and Build Setup**: `package.json` does not contain any test runners (Jest/Vitest), configurations, or scripts. Searching the workspace for files matching `*test*` or `*spec*` (excluding `node_modules` and `dist`) yielded 0 results, confirming no test suites are present. Running `npm run build` compiled the app successfully, proving the build chain functions.

---

## 3. Caveats
*   I assumed that the lack of any testing libraries in `package.json` implies no tests exist, which was verified by searching the codebase.
*   I did not verify if the Telegram webhook actually successfully sends payload to a live Telegram chat since I do not have external network access (CODE_ONLY mode) and no mock/test endpoint was available.

---

## 4. Conclusion
*   **Booking storage and flow**: Bookings are stored in Firestore `reservations` and staged in LocalStorage (`pendingReservation`) for pre-orders.
*   **Settings**: Settings are managed in Firestore documents `settings/master` and `settings/adminConfig`.
*   **Ticket routing**: Handled reactively via Firestore collections, with scheduled orders moving into active queue 60 minutes before reservation time. Confirming a reservation updates the linked order table.
*   **Firestore Rules Mismatch (Actionable)**: The security rules for reservations restrict reads and updates to authorized employees. This will block public customers from searching or cancelling their own reservations via the public booking page.
*   **Tests & Build**: No tests exist. The build runs via `npm run build` (`vite build`) and is verified to complete successfully.

---

## 5. Verification Method
1.  **Verify Rules Mismatch**: In Firestore emulator or a sandbox Firebase environment, deploy `firestore.rules` and attempt to execute the queries/updates in `Book.jsx` (lines 181, 192, 214) as an unauthenticated user. The operation will fail with a `permission-denied` error.
2.  **Verify Build**: Run `npm run build` from the project root. Confirm it produces compiled output in `/dist` without errors.
3.  **Inspect Files**: View the verified locations in `src/pages/public/Book.jsx`, `src/pages/admin/Settings.jsx`, `src/pages/admin/LiveOrders.jsx`, `src/pages/admin/Reservations.jsx`, and `firestore.rules`.
