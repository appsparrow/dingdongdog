-- Pet Image Upload Setup for DingDongDog
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Add pet fields to schedules table
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS pet_name TEXT,
ADD COLUMN IF NOT EXISTS pet_image_url TEXT;

-- Step 2: Create storage bucket for pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete pet images" ON storage.objects;

-- Step 4: Create new storage policies
CREATE POLICY "Allow authenticated users to upload pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view pet images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Step 5: Verify setup (optional - you can run this to check)
SELECT 
  'pet_name column exists' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedules' AND column_name = 'pet_name'
  ) THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
  'pet_image_url column exists' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedules' AND column_name = 'pet_image_url'
  ) THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
  'pet-images bucket exists' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'pet-images'
  ) THEN 'YES' ELSE 'NO' END as status; 