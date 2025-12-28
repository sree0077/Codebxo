# Offline Functionality Testing Guide

This guide will help you test the offline storage and sync capabilities of the Field Sales CRM application.

## 🧪 Test Scenarios

### Test 1: Offline Storage - Data Persistence
**Objective**: Verify that data persists locally when offline

**Steps:**
1. **Start the app** (online)
   ```bash
   npm start
   # Then press 'w' for web
   ```

2. **Login** with your credentials

3. **Add 2-3 clients** while online
   - Note down the client names

4. **Close the browser tab completely**

5. **Open DevTools** (F12) → Go to **Application** tab → **Local Storage**
   - Look for keys: `@field_sales_crm:clients` and `@field_sales_crm:interactions`
   - You should see your data stored as JSON

6. **Reopen the app** and login
   - ✅ **Expected**: All clients should still be visible (loaded from local storage)

---

### Test 2: Offline Mode - Create Client
**Objective**: Verify that you can create clients while offline

**Steps:**
1. **Login** to the app (online)

2. **Go offline**:
   - **Chrome DevTools**: F12 → Network tab → Check "Offline" checkbox
   - **Firefox**: F12 → Network tab → Throttling dropdown → Select "Offline"

3. **Add a new client** with these details:
   - Client Name: "Offline Test Client"
   - Phone: "9999999999"
   - Company: "Offline Co"
   - Business Type: Select any
   - Using System: Yes/No

4. **Click "Add Client"**
   - ✅ **Expected**: Client should be added successfully
   - ✅ **Expected**: You should see the client in the list

5. **Check Console** (F12 → Console tab)
   - Look for: `[CLIENTS] 📴 Client queued for sync`

6. **Check Local Storage** (F12 → Application → Local Storage)
   - Look for `@field_sales_crm:sync_queue`
   - You should see the pending operation

---

### Test 3: Offline Mode - Edit Client
**Objective**: Verify that you can edit clients while offline

**Steps:**
1. **Ensure you're still offline** (Network tab shows "Offline")

2. **Click on any client** to view details

3. **Click "Edit"** button

4. **Change the company name** to "Offline Edit Test"

5. **Save changes**
   - ✅ **Expected**: Changes should be saved
   - ✅ **Expected**: Console shows: `[CLIENTS] 📴 Client update queued for sync`

---

### Test 4: Offline Mode - Add Interaction
**Objective**: Verify that you can add interactions while offline

**Steps:**
1. **Still offline**, open any client details

2. **Click "+ Add" interaction**

3. **Fill in the form**:
   - Type: Call
   - Notes: "Offline interaction test"
   - Client Reply: "Will call back"
   - Follow-up: Tomorrow

4. **Save interaction**
   - ✅ **Expected**: Interaction should be added
   - ✅ **Expected**: Console shows: `[INTERACTIONS] 📴 Interaction queued for sync`

---

### Test 5: Auto-Sync When Coming Online
**Objective**: Verify that queued operations sync automatically when online

**Steps:**
1. **Check sync queue** before going online:
   - F12 → Application → Local Storage → `@field_sales_crm:sync_queue`
   - Note the number of pending operations

2. **Go back online**:
   - DevTools → Network tab → Uncheck "Offline"

3. **Watch the Console** (F12 → Console)
   - You should see:
     ```
     [SYNC] 🌐 Device is online
     [SYNC] 🔄 Starting sync...
     [SYNC] ✅ Processing sync queue...
     [SYNC] ✅ Sync completed successfully
     ```

4. **Check Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Firestore Database
   - ✅ **Expected**: Your offline-created data should now be in Firebase

5. **Check Local Storage**:
   - `@field_sales_crm:sync_queue` should be empty or have fewer items

---

### Test 6: Data Persistence After Refresh
**Objective**: Verify data persists after page refresh

**Steps:**
1. **While online**, note the number of clients you have

2. **Refresh the page** (F5 or Ctrl+R)

3. **Login again**

4. ✅ **Expected**: All clients should load from Firebase
5. ✅ **Expected**: Console shows: `[CLIENTS] ✅ Loaded X clients from Firebase`

---

### Test 7: Offline-First Loading
**Objective**: Verify app loads data from local storage when offline

**Steps:**
1. **Close the app completely**

2. **Go offline** (DevTools → Network → Offline)

3. **Open the app** and login

4. **Check Console**:
   - Should see: `[CLIENTS] 📴 Loading from local storage (offline mode)`

5. ✅ **Expected**: All previously synced clients should be visible
6. ✅ **Expected**: No Firebase errors in console

---

## 🔍 How to Inspect Local Storage

### Chrome/Edge:
1. Press **F12** to open DevTools
2. Go to **Application** tab
3. Expand **Local Storage** in left sidebar
4. Click on your app's URL
5. Look for these keys:
   - `@field_sales_crm:clients` - Client data
   - `@field_sales_crm:interactions` - Interaction data
   - `@field_sales_crm:sync_queue` - Pending sync operations

### Firefox:
1. Press **F12** to open DevTools
2. Go to **Storage** tab
3. Expand **Local Storage**
4. Click on your app's URL
5. View the same keys as above

---

## 🐛 Troubleshooting

### Issue: Sync not triggering when going online
**Solution**: 
- Check console for errors
- Manually trigger sync by refreshing the page
- Verify Firebase credentials are correct

### Issue: Data not persisting
**Solution**:
- Check if browser allows local storage
- Check browser's privacy settings
- Try in incognito/private mode

### Issue: Sync queue not clearing
**Solution**:
- Check Firebase connection
- Check console for Firebase errors
- Verify user is authenticated

---

## ✅ Success Criteria

Your offline functionality is working correctly if:
- ✅ Data persists in local storage
- ✅ Can create/edit/delete clients while offline
- ✅ Can add interactions while offline
- ✅ Operations are queued when offline
- ✅ Auto-sync triggers when coming online
- ✅ Sync queue clears after successful sync
- ✅ Data appears in Firebase after sync
- ✅ App loads from local storage when offline
- ✅ No data loss during offline/online transitions

