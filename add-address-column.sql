-- Add address column to postcards table
-- Run this in your Supabase SQL Editor

ALTER TABLE postcards 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'postcards'
ORDER BY ordinal_position;

