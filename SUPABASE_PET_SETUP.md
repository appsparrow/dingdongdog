# Supabase Database Setup for Pet Management

## Required SQL Queries

Run these queries in your Supabase SQL Editor to add pet management functionality to your database.

### 1. Add Pet Fields to Schedules Table

```sql
-- Add pet_name and pet_image_url columns to the schedules table
ALTER TABLE schedules 
ADD COLUMN pet_name TEXT,
ADD COLUMN pet_image_url TEXT;
```

### 2. Create Storage Bucket for Pet Images

```sql
-- Create a new storage bucket for pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true);
```

### 3. Set Up Storage Policies

```sql
-- Allow authenticated users to upload pet images
CREATE POLICY "Allow authenticated users to upload pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view pet images
CREATE POLICY "Allow authenticated users to view pet images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own pet images
CREATE POLICY "Allow authenticated users to update pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own pet images
CREATE POLICY "Allow authenticated users to delete pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);
```

### 4. Update TypeScript Types (Optional)

After running the SQL queries, you can update your TypeScript types in `src/integrations/supabase/types.ts` to include the new fields:

```typescript
schedules: {
  Row: {
    // ... existing fields
    pet_name: string | null
    pet_image_url: string | null
  }
  Insert: {
    // ... existing fields
    pet_name?: string | null
    pet_image_url?: string | null
  }
  Update: {
    // ... existing fields
    pet_name?: string | null
    pet_image_url?: string | null
  }
}
```

## Features Added

1. **Pet Name Storage**: Store pet names in the `schedules` table
2. **Pet Image Storage**: Store pet images in Supabase Storage
3. **Image Upload**: Users can upload pet photos from the settings page
4. **Image Display**: Pet images are displayed in the main app interface
5. **Fallback Handling**: Graceful fallback to emoji if image fails to load

## Usage

1. Run the SQL queries in your Supabase dashboard
2. The pet management section will appear in the settings page
3. Users can upload pet images and set pet names
4. Pet information will be displayed in the main app interface

## Security

- Only authenticated users can upload/view pet images
- Images are stored in a dedicated bucket with proper policies
- File size is limited to 5MB
- Only image files are accepted 