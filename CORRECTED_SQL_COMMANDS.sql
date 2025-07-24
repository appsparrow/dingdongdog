-- Corrected SQL Commands for Pet Image Upload Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Add pet fields to schedules table
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS pet_name TEXT,
ADD COLUMN IF NOT EXISTS pet_image_url TEXT;

-- 2. Create storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete pet images" ON storage.objects;

-- 4. Create storage policies
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