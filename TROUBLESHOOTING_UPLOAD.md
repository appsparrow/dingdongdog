# Upload Photo Troubleshooting Guide

## 🔍 **Step-by-Step Debugging**

### 1. **Check Console Logs**
Open browser developer tools (F12) and look for these console messages:
- "File input changed:"
- "Selected file:"
- "File validation passed, starting upload..."
- "Checking storage bucket..."
- "Available buckets:"
- "pet-images bucket found:"
- Any error messages

### 2. **Test Storage Access**
Click the "Test Storage Access" button in the Pet Information section to check if:
- Supabase storage is accessible
- Buckets can be listed
- Any permission errors exist

### 3. **Common Issues & Solutions**

#### **Issue: "Storage bucket 'pet-images' does not exist"**
**Solution**: Run this SQL in Supabase SQL Editor:
```sql
-- Create the pet-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true);
```

#### **Issue: "Permission denied" or "Access denied"**
**Solution**: Run these storage policies:
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

-- Allow authenticated users to update pet images
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
```

#### **Issue: "File input changed: FileList(0)"**
**Solution**: This means no file was selected. Check:
- File picker is working
- File type is supported (JPG, PNG, GIF)
- File size is under 5MB

#### **Issue: "Invalid file type"**
**Solution**: Ensure you're selecting an image file (JPG, PNG, GIF)

#### **Issue: "File too large"**
**Solution**: Select a smaller image (under 5MB)

### 4. **Complete Setup Commands**

Run these commands in order in your Supabase SQL Editor:

```sql
-- 1. Add pet fields to schedules table
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS pet_name TEXT,
ADD COLUMN IF NOT EXISTS pet_image_url TEXT;

-- 2. Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload pet images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to view pet images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update pet images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete pet images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet-images' 
  AND auth.role() = 'authenticated'
);
```

### 5. **Manual Testing Steps**

1. **Open the app** and go to Settings
2. **Click "Test Storage Access"** button
3. **Check the toast message** for bucket count or errors
4. **Try uploading a small image** (under 1MB)
5. **Check console logs** for detailed error messages
6. **Report any specific error messages** you see

### 6. **Expected Console Output**

**Successful upload should show:**
```
File input changed: FileList(1)
Selected file: pet.jpg image/jpeg 123456
File validation passed, starting upload...
Checking storage bucket...
Available buckets: [{id: "pet-images", name: "pet-images", ...}]
pet-images bucket found: {id: "pet-images", name: "pet-images", ...}
Upload path: pet-images/SESSION123-pet-1234567890.jpg
Upload successful, getting public URL...
Public URL: https://...
```

### 7. **If Still Not Working**

1. **Check Supabase Dashboard**:
   - Go to Storage section
   - Verify `pet-images` bucket exists
   - Check bucket policies

2. **Check Network Tab**:
   - Look for failed requests to Supabase
   - Check for CORS errors
   - Verify authentication headers

3. **Try Different Browser**:
   - Test in Chrome, Firefox, Safari
   - Clear browser cache and cookies

4. **Check File Permissions**:
   - Ensure file is not locked/read-only
   - Try with a different image file

### 8. **Emergency Fallback**

If upload still doesn't work, you can manually add a pet image URL:
1. Upload image to any image hosting service (Imgur, etc.)
2. Copy the direct image URL
3. Add it to the database manually:
```sql
UPDATE schedules 
SET pet_image_url = 'https://your-image-url.com/image.jpg'
WHERE session_code = 'YOUR_SESSION_CODE';
```

## 🆘 **Need Help?**

If you're still having issues, please provide:
1. Console error messages
2. Toast notification text
3. Steps you've tried
4. Browser and OS information 