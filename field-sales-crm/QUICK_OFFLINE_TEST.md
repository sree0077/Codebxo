# Quick Offline Testing Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the App
```bash
cd field-sales-crm
npm run web
```
Wait for the app to open in your browser (usually http://localhost:8081)

### Step 2: Login
- Use your existing account or create a new one
- You should see the **Online Status Indicator** in the top-right corner showing "🌐 Online"

### Step 3: Add a Client (While Online)
1. Click the **"+"** button
2. Fill in:
   - Client Name: "Test Client 1"
   - Phone: "1234567890"
   - Company: "Test Co"
   - Business Type: Select any
   - Using System: Yes
3. Click "Add Client"
4. ✅ Client should appear in the list

### Step 4: Go Offline
**Chrome/Edge:**
1. Press **F12** to open DevTools
2. Click **Network** tab
3. Check the **"Offline"** checkbox

**Firefox:**
1. Press **F12** to open DevTools
2. Click **Network** tab
3. Click **Throttling** dropdown → Select **"Offline"**

👀 **Watch the status indicator** - it should change to "📴 Offline"

### Step 5: Add a Client (While Offline)
1. Click the **"+"** button
2. Fill in:
   - Client Name: "Offline Client"
   - Phone: "9999999999"
   - Company: "Offline Co"
   - Business Type: Select any
   - Using System: No
3. Click "Add Client"
4. ✅ Client should be added successfully
5. ✅ Check browser console (F12 → Console) - you should see:
   ```
   [CLIENTS] 📴 Client queued for sync
   ```

### Step 6: Verify Local Storage
1. Press **F12** → **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Expand **Local Storage** → Click your app URL
3. Look for these keys:
   - `@field_sales_crm:clients` - Should contain both clients
   - `@field_sales_crm:sync_queue` - Should contain the offline operation

### Step 7: Go Back Online
1. DevTools → Network tab → **Uncheck "Offline"**
2. 👀 **Watch the status indicator** - should show "🔄 Syncing..." then "🌐 Online"
3. ✅ Check console - you should see:
   ```
   [SYNC] 🌐 Device is online
   [SYNC] 🔄 Starting sync...
   [SYNC] ✅ Sync completed successfully
   ```

### Step 8: Verify Sync
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Open the **clients** collection
4. ✅ You should see "Offline Client" in Firebase now

### Step 9: Test Offline Persistence
1. **Close the browser tab completely**
2. **Go offline** (DevTools → Network → Offline)
3. **Reopen the app** and login
4. ✅ All clients should still be visible (loaded from local storage)
5. ✅ Status indicator shows "📴 Offline"

---

## 🎯 What You Just Tested

✅ **Online Operations** - Data saves to Firebase and local storage  
✅ **Offline Operations** - Data saves to local storage and queues for sync  
✅ **Sync Queue** - Operations are queued when offline  
✅ **Auto-Sync** - Automatic sync when coming online  
✅ **Data Persistence** - Data persists in local storage  
✅ **Offline-First** - App works completely offline  

---

## 🔍 Visual Indicators

### Status Indicator Colors:
- **🌐 Green** = Online and connected
- **🔄 Orange** = Currently syncing
- **📴 Red** = Offline mode

### Console Messages to Look For:

**When Online:**
```
[CLIENTS] ✅ Loaded X clients from Firebase
[CLIENTS] ✅ Client added successfully
```

**When Offline:**
```
[CLIENTS] 📴 Loading from local storage (offline mode)
[CLIENTS] 📴 Client queued for sync
```

**When Syncing:**
```
[SYNC] 🌐 Device is online
[SYNC] 🔄 Starting sync...
[SYNC] ✅ Processing sync queue...
[SYNC] ✅ Sync completed successfully
```

---

## 🧪 Additional Tests

### Test Edit Offline
1. Go offline
2. Click on a client → Edit
3. Change company name
4. Save
5. ✅ Should save locally and queue for sync

### Test Delete Offline
1. Go offline
2. Click on a client → Delete
3. Confirm deletion
4. ✅ Should delete locally and queue for sync

### Test Add Interaction Offline
1. Go offline
2. Click on a client
3. Click "+ Add" interaction
4. Fill in details and save
5. ✅ Should save locally and queue for sync

---

## 📱 Testing on Mobile

If you want to test on a real mobile device:

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Scan QR code** with Expo Go app

3. **Toggle Airplane Mode** on your phone to test offline

4. **Check React Native Debugger** for console logs

---

## ✅ Success Checklist

- [ ] App shows online/offline status indicator
- [ ] Can add clients while online
- [ ] Can add clients while offline
- [ ] Offline operations appear in sync queue
- [ ] Auto-sync triggers when coming online
- [ ] Data persists after closing and reopening app
- [ ] App works completely offline
- [ ] No data loss during offline/online transitions

---

## 🐛 Troubleshooting

**Issue: Status indicator not showing**
- Refresh the page
- Check that useSync hook is working

**Issue: Sync not triggering**
- Check Firebase credentials
- Check browser console for errors
- Try manual refresh

**Issue: Data not persisting**
- Check browser allows local storage
- Check privacy settings
- Try incognito mode

---

For detailed testing scenarios, see `OFFLINE_TESTING_GUIDE.md`

