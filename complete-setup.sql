-- Complete Setup Script for Postcard Map
-- Run this ONCE in your Supabase SQL Editor to fix all issues

-- ============================================
-- 1. Add missing address column
-- ============================================
ALTER TABLE postcards 
ADD COLUMN IF NOT EXISTS address TEXT;

-- ============================================
-- 2. Fix Row Level Security Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON postcards;
DROP POLICY IF EXISTS "Public insert access" ON postcards;
DROP POLICY IF EXISTS "Enable read access for all users" ON postcards;
DROP POLICY IF EXISTS "Enable insert for all users" ON postcards;

-- Enable RLS
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read postcards
CREATE POLICY "Enable read access for all users"
ON postcards FOR SELECT USING (true);

-- Allow anyone to insert postcards
CREATE POLICY "Enable insert for all users"
ON postcards FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. Fix Storage Policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for postcard images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for postcard images" ON storage.objects;

-- Allow anyone to read images from postcard-images bucket
CREATE POLICY "Public read access for postcard images"
ON storage.objects FOR SELECT
USING (bucket_id = 'postcard-images');

-- Allow anyone to upload images to postcard-images bucket
CREATE POLICY "Public upload access for postcard images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'postcard-images');

-- ============================================
-- 4. Verify Everything
-- ============================================

-- Check postcards table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'postcards'
ORDER BY ordinal_position;

-- Check postcards policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'postcards';

-- Check storage policies
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%postcard%';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Setup complete! Try uploading a postcard now.';
END $$;

