-- Fix Row Level Security Policies for Postcards Table
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON postcards;
DROP POLICY IF EXISTS "Public insert access" ON postcards;
DROP POLICY IF EXISTS "Enable read access for all users" ON postcards;
DROP POLICY IF EXISTS "Enable insert for all users" ON postcards;

-- Enable RLS (if not already enabled)
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to read postcards
CREATE POLICY "Enable read access for all users"
ON postcards
FOR SELECT
USING (true);

-- Policy 2: Allow anyone to insert postcards
CREATE POLICY "Enable insert for all users"
ON postcards
FOR INSERT
WITH CHECK (true);

-- Optional: Allow anyone to update their own postcards (uncomment if needed)
-- CREATE POLICY "Enable update for all users"
-- ON postcards
-- FOR UPDATE
-- USING (true)
-- WITH CHECK (true);

-- Optional: Allow anyone to delete postcards (uncomment if needed)
-- CREATE POLICY "Enable delete for all users"
-- ON postcards
-- FOR DELETE
-- USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'postcards';

