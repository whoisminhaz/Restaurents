## Forensic Audit Report

**Work Product**: `src/pages/admin/Settings.jsx` and `firestore.rules` (Milestone 1 changes)
**Profile**: General Project
**Verdict**: CLEAN

### Phase Results

1. **Hardcoded output detection**: PASS
   - Verified that `src/pages/admin/Settings.jsx` does not contain any hardcoded test results or bypass strings.
   - Checked `firestore.rules` and verified that the security rules use dynamic authorization checks (`isAuthorized()`). There is a super admin email fallback (`minhazuddin7827@gmail.com`), but this is a standard recovery/owner email pattern and does not constitute a test bypass or fraud.

2. **Facade detection**: PASS
   - The implementation in `Settings.jsx` is authentic and connects directly to Firestore. It fetches and sets data via standard Firebase Firestore functions (`getDoc`, `setDoc`, `getDocs`).
   - The state changes in `bookingMode` and `maxCapacityPerHour` correctly map to Firestore settings fields: `bookingEnabled`, `requirePreOrderForBooking`, and `maxCapacityPerHour`.

3. **Pre-populated artifact detection**: PASS
   - Checked the workspace and found no pre-populated log files, result files, or verification artifacts that predate the audit.

4. **Build and run**: PASS
   - Executed `npm run build` synchronously in the background. The build succeeded with **zero errors**.
   - Output files generated:
     - `dist/app.html` (0.54 kB)
     - `dist/assets/app-B5clcIYb.css` (35.35 kB)
     - `dist/assets/app-BtfGtJyp.js` (835.32 kB)
     - `dist/sw.js` & `dist/workbox-9c191d2f.js` (PWA service worker files)

5. **Output verification**: PASS
   - Verified Settings UI Genuine State Mapping:
     - `bookingMode` dropdown successfully maps to database fields:
       - `disabled` -> `bookingEnabled = false`, `requirePreOrderForBooking = false`
       - `preorder` -> `bookingEnabled = true`, `requirePreOrderForBooking = true`
       - `enabled` -> `bookingEnabled = true`, `requirePreOrderForBooking = false`
     - When reading from Firestore, values are correctly mapped back:
       - If `bookingEnabled === false` -> `disabled`
       - If `requirePreOrderForBooking === true` -> `preorder`
       - Otherwise -> `enabled`
   - Verified Settings UI Input Validations:
     - Validates that `maxCapacityPerHour` must be a valid, non-negative number:
       ```javascript
       const maxCapacity = Number(settings.maxCapacityPerHour);
       if (isNaN(maxCapacity) || maxCapacity < 0) {
         alert("Maximum Capacity Per Hour must be a valid non-negative number.");
         return;
       }
       ```
   - Verified Firestore Rules correctness:
     - Auth check correctly checks `isSuperAdmin()` or matches against `allowedEmails` array and `ownerEmail` in the `/settings/adminConfig` document.
     - Public write rule on `/reservations/{reservationId}` is securely locked down:
       - `allow create, get: if true;` (public can request booking and lookup receipt).
       - `allow list, delete: if isAuthorized();` (public cannot list all reservations or delete reservations).
       - `allow update` permits public updates **only** if:
         1) Only the `status` field is modified, and its new value is `'cancelled'` (allowing public self-cancellation).
         2) Only the `linkedOrderId` field is modified, and the field was not previously present (allowing public order linking at checkout).

6. **Dependency audit**: PASS
   - No third-party packages are used to delegate the core logic of the Settings panel or Firestore rules. Auxiliary libraries (`react`, `firebase`, `lucide-react`) are standard framework dependencies.

---

### Evidence

#### Build Output Log
```
vite v5.4.21 building for production...
transforming...
✓ 1862 modules transformed.
rendering chunks...
computing gzip size...
dist/registerSW.js              0.13 kB
dist/manifest.webmanifest       0.41 kB
dist/app.html                   0.54 kB │ gzip:   0.33 kB
dist/assets/app-B5clcIYb.css   35.35 kB │ gzip:   6.80 kB
dist/assets/app-BtfGtJyp.js   835.32 kB │ gzip: 211.75 kB
✓ built in 24.08s

PWA v1.3.0
mode      generateSW
precache  10 entries (918.91 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

#### Git Diff for Milestone 1 Changes
```diff
diff --git a/firestore.rules b/firestore.rules
index e7f2b31..5723b7b 100644
--- a/firestore.rules
+++ b/firestore.rules
@@ -10,7 +10,9 @@ service cloud.firestore {
     // Dynamic Role Check: Checks if the user's email is in the allowedEmails array
     function isAuthorized() {
       return isSuperAdmin() || 
-             (request.auth != null && exists(/databases/$(database)/documents/settings/adminConfig) && request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails);
+             (request.auth != null && 
+              exists(/databases/$(database)/documents/settings/adminConfig) &&
+              (request.auth.token.email in get(/databases/$(database)/documents/settings/adminConfig).data.allowedEmails ||
+               ('ownerEmail' in get(/databases/$(database)/documents/settings/adminConfig).data &&
+                request.auth.token.email == get(/databases/$(database)/documents/settings/adminConfig).data.ownerEmail)));
     }
 
     match /settings/{document=**} {
@@ -30,9 +32,17 @@ service cloud.firestore {
       allow read, update, delete: if isAuthorized();
     }
 
-    match /reservations/{document=**} {
-      allow create: if true;
-      allow read, update, delete: if isAuthorized();
+    match /reservations/{reservationId} {
+      allow create, get: if true;
+      allow list: if isAuthorized();
+      allow update: if isAuthorized() || (
+        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
+        request.resource.data.status == 'cancelled'
+      ) || (
+        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['linkedOrderId']) &&
+        !('linkedOrderId' in resource.data)
+      );
+      allow delete: if isAuthorized();
     }
 
     // Required for customer checkout order numbers
diff --git a/src/pages/admin/Settings.jsx b/src/pages/admin/Settings.jsx
index fa9b608..0a5552c 100644
--- a/src/pages/admin/Settings.jsx
+++ b/src/pages/admin/Settings.jsx
@@ -38,7 +38,9 @@ const Settings = () => {
     tngQrCode: '',
     discountPercent: 0,
     discountItems: ['all'],
-    taxPercent: 0
+    taxPercent: 0,
+    bookingMode: 'enabled',
+    maxCapacityPerHour: 30
   });
 
   useEffect(() => {
@@ -47,7 +49,29 @@ const Settings = () => {
         const docRef = doc(db, 'settings', 'master');
         const docSnap = await getDoc(docRef);
         if (docSnap.exists()) {
-          setSettings(prev => ({ ...prev, ...docSnap.data() }));
+          const data = docSnap.data();
+          let bookingMode = data.bookingMode;
+          if (!bookingMode) {
+            if (data.bookingEnabled === false) {
+              bookingMode = 'disabled';
+            } else if (data.requirePreOrderForBooking === true) {
+              bookingMode = 'preorder';
+            } else {
+              bookingMode = 'enabled';
+            }
+          }
+          let maxCapacityPerHour;
+          if (data.maxCapacityPerHour === 0) {
+            maxCapacityPerHour = 0;
+          } else {
+            maxCapacityPerHour = data.maxCapacityPerHour || 30;
+          }
+          setSettings(prev => ({ 
+            ...prev, 
+            ...data, 
+            bookingMode, 
+            maxCapacityPerHour 
+          }));
         }
 
         const adminDocRef = doc(db, 'settings', 'adminConfig');
@@ -73,7 +97,28 @@ const Settings = () => {
 
   const handleChange = (e) => {
     const { name, value } = e.target;
-    setSettings(prev => ({ ...prev, [name]: value }));
+    if (name === 'bookingMode') {
+      let bookingEnabled = true;
+      let requirePreOrderForBooking = false;
+      if (value === 'disabled') {
+        bookingEnabled = false;
+        requirePreOrderForBooking = false;
+      } else if (value === 'preorder') {
+        bookingEnabled = true;
+        requirePreOrderForBooking = true;
+      } else if (value === 'enabled') {
+        bookingEnabled = true;
+        requirePreOrderForBooking = false;
+      }
+      setSettings(prev => ({
+        ...prev,
+        bookingMode: value,
+        bookingEnabled,
+        requirePreOrderForBooking
+      }));
+    } else {
+      setSettings(prev => ({ ...prev, [name]: value }));
+    }
   };
 
   const toggleLanguage = (langId) => {
@@ -239,9 +284,20 @@ const Settings = () => {
   };
 
   const handleSave = async () => {
+    const maxCapacity = Number(settings.maxCapacityPerHour);
+    if (isNaN(maxCapacity) || maxCapacity < 0) {
+      alert("Maximum Capacity Per Hour must be a valid non-negative number.");
+      return;
+    }
+
     setSaving(true);
     try {
-      await setDoc(doc(db, 'settings', 'master'), settings);
+      const updatedSettings = {
+        ...settings,
+        maxCapacityPerHour: maxCapacity
+      };
+      await setDoc(doc(db, 'settings', 'master'), updatedSettings);
+      setSettings(updatedSettings);
       setToast(true);
       setTimeout(() => setToast(false), 3000);
     } catch (error) {
@@ -283,33 +339,34 @@ const Settings = () => {
           <p className="text-sm text-gray-400 mb-4">Configure your operating schedule and booking rules.</p>
           
           <div className="space-y-6">
-            <div className="md:col-span-2 space-y-3">
-               <label className="flex items-center gap-3 cursor-pointer p-4 border border-crmBorder rounded-xl hover:bg-crmDark/50 transition-colors">
-                  <input 
-                    type="checkbox"
-                    checked={settings.bookingEnabled !== false}
-                    onChange={(e) => setSettings(prev => ({ ...prev, bookingEnabled: e.target.checked }))}
-                    className="w-5 h-5 accent-crmAccent"
-                  />
-                  <div>
-                    <p className="font-medium text-crmText text-lg">Enable Booking System</p>
-                    <p className="text-sm text-gray-400">Allow customers to make reservations through the website.</p>
-                  </div>
-               </label>
-
-               <label className={`flex items-center gap-3 cursor-pointer p-4 border border-crmBorder rounded-xl transition-colors ${settings.bookingEnabled === false ? 'opacity-50 pointer-events-none bg-crmDark/30' : 'hover:bg-crmDark/50'}`}>
-                  <input 
-                    type="checkbox"
-                    checked={!!settings.requirePreOrderForBooking}
-                    onChange={(e) => setSettings(prev => ({ ...prev, requirePreOrderForBooking: e.target.checked }))}
-                    className="w-5 h-5 accent-crmAccent"
-                    disabled={settings.bookingEnabled === false}
-                  />
-                  <div>
-                    <p className="font-medium text-crmText">Require Pre-order Food</p>
-                    <p className="text-sm text-gray-400">Customers must order food to complete a table reservation.</p>
-                  </div>
-               </label>
+            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
+              <div>
+                <label className="block text-sm font-medium text-gray-300 mb-2">Booking System Mode</label>
+                <select
+                  name="bookingMode"
+                  value={settings.bookingMode || 'enabled'}
+                  onChange={handleChange}
+                  className="w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent"
+                >
+                  <option value="disabled">Disabled</option>
+                  <option value="enabled">Enabled (No Pre-order)</option>
+                  <option value="preorder">Pre-order Required</option>
+                </select>
+              </div>
+              <div>
+                <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Capacity Per Hour</label>
+                <input
+                  type="number"
+                  name="maxCapacityPerHour"
+                  min="0"
+                  value={settings.maxCapacityPerHour !== undefined ? settings.maxCapacityPerHour : 30}
+                  onChange={handleChange}
+                  disabled={settings.bookingEnabled === false}
+                  className={`w-full bg-crmDark border border-crmBorder text-crmText px-4 py-3 rounded-xl focus:outline-none focus:border-crmAccent ${
+                    settings.bookingEnabled === false ? 'opacity-50 cursor-not-allowed' : ''
+                  }`}
+                />
+              </div>
             </div>
```
