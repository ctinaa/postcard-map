-- Fix Storage Policies for postcard-images Bucket
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for postcard images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for postcard images" ON storage.objects;

-- Policy 1: Allow anyone to read images from postcard-images bucket
CREATE POLICY "Public read access for postcard images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'postcard-images');

-- Policy 2: Allow anyone to upload images to postcard-images bucket
CREATE POLICY "Public upload access for postcard images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'postcard-images');

-- Verify the policies were created
SELECT *
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';

