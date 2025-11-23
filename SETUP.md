# Postcard Map Setup Guide

## 🚀 Quick Setup

### 1. Google Maps API Key

You need a Google Maps API key to use the location picker.

#### Get your API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to "Credentials" and create an API key
5. (Optional) Restrict your API key to your domain

#### Add to your `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Current status:** ⚠️ Commented out in `.env.local` - uncomment and add your key

---

### 2. Supabase Storage Setup

You need to create a storage bucket for postcard images.

#### Create the storage bucket:
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `postcard-images`
5. Make it **Public** (check the public checkbox)
6. Click **Create bucket**

#### Set up storage policies:
Go to **Policies** tab for the `postcard-images` bucket and add these policies:

**Policy 1: Allow public read access**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'postcard-images' );
```

**Policy 2: Allow authenticated uploads**
```sql
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'postcard-images' );
```

---

### 3. Supabase Database Setup

Create the `postcards` table in your Supabase database.

#### Run this SQL in the Supabase SQL Editor:

```sql
-- Create postcards table
CREATE TABLE postcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  city TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_postcards_created_at ON postcards(created_at DESC);
CREATE INDEX idx_postcards_location ON postcards(latitude, longitude);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read postcards
CREATE POLICY "Public read access"
ON postcards FOR SELECT
USING (true);

-- Allow anyone to insert postcards (adjust based on your needs)
CREATE POLICY "Public insert access"
ON postcards FOR INSERT
WITH CHECK (true);
```

---

## 📱 Features

### Home Page (`/`)
- **Interactive Map**: Leaflet map with clustered markers
- **Auto-rotating Carousel**: Cycles through postcards every 4 seconds
- **Responsive Design**: Works on mobile and desktop

### Add Postcard Page (`/postcards/new`)
- **Camera Capture**: Take photos directly from your device
- **File Upload**: Upload existing images
- **Location Picker**: Search or click on map to set location
- **Auto-location**: Use your current GPS location
- **Geocoding**: Automatically gets city and country from coordinates

---

## 🔧 Environment Variables

Your `.env.local` should look like this:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://sqdrufadtbfnubhcwdci.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🎯 Testing

After setup, test the following:

1. **Visit home page** (`/`) - Should show map with demo postcards
2. **Click "Add Postcard"** - Should open upload form
3. **Upload an image** - Test both file upload and camera capture
4. **Select location** - Search for a place or click on map
5. **Submit** - Should redirect to home with new postcard on map

---

## 🐛 Troubleshooting

### Map not loading?
- Check if Google Maps API key is set correctly
- Ensure Maps JavaScript API and Places API are enabled in Google Cloud Console

### Image upload failing?
- Verify `postcard-images` bucket exists in Supabase Storage
- Check that the bucket is set to **Public**
- Verify storage policies are set up correctly

### Location picker not working?
- Check browser console for API errors
- Ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set
- Try enabling billing in Google Cloud Console (required for Places API)

---

## 📦 Next Steps

1. Customize the styling to match your brand
2. Add authentication (require login to upload)
3. Add editing/deletion functionality
4. Add comments or likes to postcards
5. Export postcards or create collections

---

## 🔒 Security Notes

- Currently, anyone can upload postcards (adjust RLS policies if needed)
- Consider adding authentication for uploads
- Set up API key restrictions in Google Cloud Console
- Monitor Supabase storage usage

---

Happy mapping! 🗺️📮

