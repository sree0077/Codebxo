# Clean Up Duplicate Clients

You currently have 476 duplicate clients in your Firebase database due to the infinite loop bug.

## Option 1: Delete All Clients (Recommended for Testing)

If these are all test clients and you want to start fresh:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: field-sales-crm
3. **Go to Firestore Database** (left sidebar)
4. **Click on the `clients` collection**
5. **Delete all documents**:
   - Click the three dots (⋮) next to the collection name
   - Select "Delete collection"
   - Confirm the deletion

6. **Do the same for `interactions` collection** if needed

7. **Clear your browser's local storage**:
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Local Storage" → your domain
   - Right-click → "Clear"

8. **Refresh the app** and start fresh!

## Option 2: Keep Unique Clients (If you have real data)

If you have real client data mixed with duplicates:

### Manual Cleanup:
1. Go to Firestore Database
2. Look at the `clients` collection
3. Identify unique clients by name/company
4. Delete duplicate entries manually

### Automated Cleanup (Advanced):

Create a script to remove duplicates. Here's a Firebase Cloud Function example:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function removeDuplicateClients(userId) {
  const db = admin.firestore();
  const clientsRef = db.collection('clients');
  const snapshot = await clientsRef.where('userId', '==', userId).get();
  
  const seen = new Map();
  const toDelete = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const key = `${data.clientName}-${data.companyName}-${data.phoneNumber}`;
    
    if (seen.has(key)) {
      // This is a duplicate
      toDelete.push(doc.id);
    } else {
      // First occurrence, keep it
      seen.set(key, doc.id);
    }
  });
  
  console.log(`Found ${toDelete.length} duplicates to delete`);
  
  // Delete duplicates in batches
  const batch = db.batch();
  toDelete.forEach(id => {
    batch.delete(clientsRef.doc(id));
  });
  
  await batch.commit();
  console.log('Duplicates removed!');
}

// Run it
removeDuplicateClients('YOUR_USER_ID_HERE');
```

## Option 3: Clear Everything and Start Fresh

The easiest way:

1. **Clear Firebase**:
   ```bash
   # In Firebase Console
   - Delete `clients` collection
   - Delete `interactions` collection
   ```

2. **Clear Local Storage**:
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   ```

3. **Refresh the app**:
   ```bash
   # The app will start with a clean slate
   ```

## After Cleanup

Once you've cleaned up:

1. **Test the fix**:
   - Go offline
   - Add a test client
   - Go online
   - Verify only ONE client appears

2. **Monitor the console**:
   - You should see:
     ```
     [SYNC] 🔄 Initial sync for user: ...
     [CLIENTS] 📥 loadClients.fulfilled - Received 1 clients
     [CLIENTS] ✅ Final state: 1 unique clients
     ```
   - You should NOT see repeated loading

## Prevention

The infinite loop bug has been fixed in commit `633789e`. The fix ensures:
- ✅ Sync only happens once when user logs in
- ✅ Sync only happens when going from offline to online
- ✅ No infinite loops
- ✅ Proper cleanup of temp IDs

## Your User ID

To find your user ID for cleanup scripts:

1. Open browser console (F12)
2. Type:
   ```javascript
   JSON.parse(localStorage.getItem('@field_sales_crm/user'))
   ```
3. Look for the `id` field

Or check the console logs - it's printed when you log in:
```
[SYNC] 🔄 Initial sync for user: HIGgQ1mojMec3RsZ88cRurbJVg52
```

