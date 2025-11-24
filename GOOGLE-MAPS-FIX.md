# Google Maps API Troubleshooting Guide

## 🔍 Your Current Setup

- **API Key**: `AIzaSyCJ-RbYlVWlS2fQqmDTkERThjNiFvXzTIg`
- **Status**: Key is set in `.env.local` ✅
- **Issue**: API not working (likely missing API enablement or restrictions)

---

## ✅ Step-by-Step Fix

### **Step 1: Enable Required APIs**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or the project where this API key was created)
3. Go to **"APIs & Services"** → **"Library"**
4. Search and **ENABLE** these APIs (click each one and click "Enable"):

   Required APIs:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API** 
   - ✅ **Geocoding API**

### **Step 2: Check API Key Restrictions**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click on your API key: `AIzaSyCJ...`
3. Under **"API restrictions"**:
   - Choose: **"Restrict key"**
   - Select ONLY these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Click **Save**

4. Under **"Application restrictions"**:
   - Choose: **"HTTP referrers (websites)"**
   - Add these referrers:
     ```
     http://localhost:3000/*
     http://localhost:*
     https://christinacook.me/*
     https://*.vercel.app/*
     ```
   - Click **Save**

### **Step 3: Verify Billing is Enabled**

⚠️ **Important**: Google Maps requires billing to be enabled (even though you get $200/month free)

1. Go to **"Billing"** in Google Cloud Console
2. Make sure a billing account is linked to your project
3. You won't be charged unless you exceed $200/month in usage

### **Step 4: Test the Fix**

1. **Wait 2-5 minutes** for changes to propagate
2. **Hard refresh** your browser (Cmd+Shift+R or Ctrl+Shift+F5)
3. Try the location search

---

## 🧪 Test Your API Key

Run this in your browser console to test if the API is working:

```javascript
fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=AIzaSyCJ-RbYlVWlS2fQqmDTkERThjNiFvXzTIg`)
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected Result**: Should return location data for Paris  
**If ERROR**: Check the error message for specific issues

---

## 🐛 Common Errors and Fixes

### Error: "This API key is not authorized"
**Fix**: Add your domain to HTTP referrers (Step 2)

### Error: "This API project is not authorized"  
**Fix**: Enable the required APIs (Step 1)

### Error: "REQUEST_DENIED"
**Fix**: Enable billing on your Google Cloud project (Step 3)

### Error: "RefererNotAllowedMapError"
**Fix**: Check HTTP referrers match your domain exactly

---

## 🔄 Alternative: Create New API Key

If the above doesn't work, create a fresh API key:

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the new key
4. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_new_api_key_here
   ```
5. Restart dev server: `npm run dev`

---

## 📝 Quick Checklist

- [ ] All 3 APIs enabled (Maps JavaScript, Places, Geocoding)
- [ ] API key restrictions set correctly
- [ ] HTTP referrers include localhost and your domain
- [ ] Billing is enabled (even if using free tier)
- [ ] Waited 5 minutes for changes to propagate
- [ ] Hard refreshed browser
- [ ] Restarted dev server

---

## 💡 Pro Tips

1. **Monitor Usage**: Check [Google Cloud Console → APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard) to see API calls
2. **Set Quotas**: Prevent accidental overuse by setting daily quotas
3. **Multiple Keys**: Create separate keys for dev/prod environments
4. **Restrict by IP**: For server-side only, use IP restrictions instead of HTTP referrers

---

## 🆘 Still Not Working?

If you've done all the above and it still doesn't work:

1. Check browser console for specific error messages
2. Try the API key test code above
3. Create a completely new Google Cloud project and API key
4. Contact Google Cloud Support

The most common issue is **billing not enabled** - even for free tier, you must have a billing account linked!

---

Need more help? Share the specific error message from your browser console.

