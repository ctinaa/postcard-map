# Debugging: Why Pins Aren't Showing on Map

## 🔍 Quick Diagnostics

### **Step 1: Check Browser Console**

Open your browser at http://localhost:3000 and press F12 (or Cmd+Option+I on Mac) to open Developer Tools. Look for:

```
Fetching postcards from Supabase...
Fetched postcards: [...]
Found X postcards, updating map
```

**If you see "No postcards in database"** → You need to create postcards first!  
**If you see an error** → Check the error message below

---

## 🐛 Common Issues & Fixes

### **Issue 1: No Postcards in Database**

**Symptoms**: You see demo postcards (Lisbon, Tokyo, New York) but not your uploaded ones.

**Fix**: 
1. Make sure you've successfully uploaded a postcard
2. Check if the upload completed without errors
3. Verify the `postcards` table exists in Supabase

**Verify in Supabase**:
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Table Editor**
3. Check if `postcards` table exists
4. Look for your uploaded postcards
5. Verify they have `latitude` and `longitude` values

---

### **Issue 2: Missing Latitude/Longitude**

**Symptoms**: Postcards exist in database but don't show on map.

**Fix**: Postcards MUST have valid lat/lng coordinates to show on the map.

**Check your data**:
```sql
SELECT id, title, city, latitude, longitude 
FROM postcards;
```

If `latitude` or `longitude` is NULL, the pin won't show!

**Solution**: Make sure you select a location when uploading:
1. Use the location search bar
2. Or click on the map to set location
3. The location picker will auto-fill lat/lng

---

### **Issue 3: Table Doesn't Exist**

**Symptoms**: Console shows error: "relation 'postcards' does not exist"

**Fix**: Run the database setup SQL:

1. Open `complete-setup.sql` or `supabase-setup.sql`
2. Go to Supabase → SQL Editor
3. Paste and run the SQL
4. Verify table created successfully

---

### **Issue 4: Supabase Connection Error**

**Symptoms**: Console shows "supabaseUrl is required" or connection errors

**Fix**: 
1. Check `.env.local` has correct values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```
2. Restart dev server: `npm run dev`
3. Hard refresh browser (Cmd+Shift+R)

---

### **Issue 5: Row Level Security Blocking Reads**

**Symptoms**: Upload works but postcards don't show

**Fix**: Make sure RLS policies allow reading:

```sql
-- Allow anyone to read postcards
CREATE POLICY "Enable read access for all users"
ON postcards FOR SELECT USING (true);
```

Run this in Supabase SQL Editor.

---

## ✅ Quick Test Checklist

- [ ] `postcards` table exists in Supabase
- [ ] Table has RLS policies for SELECT (read)
- [ ] At least one postcard uploaded successfully
- [ ] Postcard has valid `latitude` and `longitude` values
- [ ] Console shows "Fetched postcards: [...]" with data
- [ ] No errors in browser console
- [ ] Dev server restarted after .env changes
- [ ] Hard refreshed browser

---

## 🧪 Manual Test

1. **Upload a test postcard**:
   - Click "Add Postcard"
   - Take/upload photo
   - **IMPORTANT**: Select location (search or click map)
   - Add title
   - Submit

2. **Check console**: Should see "Found 1 postcards, updating map"

3. **Look at map**: Pin should appear at selected location

---

## 📊 Expected Console Output

```
Fetching postcards from Supabase...
Fetched postcards: [
  {
    id: "123abc",
    title: "My Postcard",
    image_url: "https://...",
    city: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522
  }
]
Found 1 postcards, updating map
```

---

## 🆘 Still Not Working?

If pins still aren't showing:

1. **Check Network Tab**:
   - Open DevTools → Network tab
   - Look for request to Supabase
   - Check if it returns data

2. **Test Supabase directly**:
   ```javascript
   // Run in browser console
   import { supabase } from '@/lib/supabaseClient';
   const { data } = await supabase.from('postcards').select('*');
   console.log(data);
   ```

3. **Verify Map Component**:
   - Demo postcards should show (Lisbon, Tokyo, New York)
   - If even demo postcards don't show → Map component issue
   - If only your postcards don't show → Database/data issue

---

## 💡 Pro Tip

The demo postcards (Lisbon, Tokyo, New York) are hardcoded and will ALWAYS show if:
1. No database connection, OR
2. Database returns 0 postcards

Once you upload your first postcard successfully, it will REPLACE the demo postcards.

---

Need more help? Check the browser console for specific error messages!

