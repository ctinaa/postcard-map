-- Postcard Map Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create postcards table
CREATE TABLE IF NOT EXISTS postcards (
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

-- If the table already exists, add the address column
ALTER TABLE postcards ADD COLUMN IF NOT EXISTS address TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_postcards_created_at ON postcards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_postcards_location ON postcards(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Public read access" ON postcards;
DROP POLICY IF EXISTS "Public insert access" ON postcards;

-- Allow anyone to read postcards
CREATE POLICY "Public read access"
ON postcards FOR SELECT
USING (true);

-- Allow anyone to insert postcards
-- NOTE: In production, you may want to restrict this to authenticated users
CREATE POLICY "Public insert access"
ON postcards FOR INSERT
WITH CHECK (true);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_postcards_updated_at ON postcards;
CREATE TRIGGER update_postcards_updated_at
    BEFORE UPDATE ON postcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Postcards table created successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Create a storage bucket named "postcard-images" and make it public';
    RAISE NOTICE '   2. Add storage policies for the bucket';
    RAISE NOTICE '   3. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local';
END $$;

