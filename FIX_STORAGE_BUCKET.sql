-- Fix Storage Bucket Creation for Pet Images
-- Run this in your Supabase SQL Editor

-- Step 1: Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-images', 
  'pet-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to pet images" ON storage.objects;

-- Step 4: Create comprehensive storage policies
-- Allow authenticated users to upload to pet-images bucket
CREATE POLICY "Allow authenticated users to upload pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public access to view pet images (since bucket is public)
CREATE POLICY "Allow public access to view pet images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-images'
);

-- Allow authenticated users to update their own pet images
CREATE POLICY "Allow authenticated users to update pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete pet images
CREATE POLICY "Allow authenticated users to delete pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Step 5: Verify the setup
SELECT 
  'pet-images bucket exists' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'pet-images'
  ) THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
  'bucket is public' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'pet-images' AND public = true
  ) THEN 'YES' ELSE 'NO' END as status
UNION ALL
SELECT 
  'storage policies exist' as check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
  ) THEN 'YES' ELSE 'NO' END as status; 