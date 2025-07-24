# Manual Storage Bucket Setup for Pet Images

## Problem
The bucket exists but uploads are failing with: `new row violates row-level security policy`

## Solution
We need to add the correct RLS policies to allow authenticated users to upload files.

---

## Step 1: Create Bucket in Dashboard

1. **Go to Supabase Dashboard** → Your Project → Storage
2. **Click "Create a new bucket"**
3. **Bucket name**: `pet-images`
4. **Public bucket**: ✅ Check this (so images can be viewed)
5. **Click "Create bucket"**

---

## Step 2: Add Storage Policies

**Go to Supabase Dashboard** → Your Project → Storage → `pet-images` bucket → Policies

### Policy 1: Allow Authenticated Users to Upload Files

1. **Click "New Policy"**
2. **Policy name**: `Allow authenticated users to upload pet images`
3. **Allowed operation**: `INSERT`
4. **Target roles**: `authenticated`
5. **Policy definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
6. **Click "Review"** then **"Save policy"**

### Policy 2: Allow Authenticated Users to View Files

1. **Click "New Policy"**
2. **Policy name**: `Allow authenticated users to view pet images`
3. **Allowed operation**: `SELECT`
4. **Target roles**: `authenticated`
5. **Policy definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
6. **Click "Review"** then **"Save policy"**

### Policy 3: Allow Users to Update Their Own Files

1. **Click "New Policy"**
2. **Policy name**: `Allow users to update their own pet images`
3. **Allowed operation**: `UPDATE`
4. **Target roles**: `authenticated`
5. **Policy definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
6. **Click "Review"** then **"Save policy"**

### Policy 4: Allow Users to Delete Their Own Files

1. **Click "New Policy"**
2. **Policy name**: `Allow users to delete their own pet images`
3. **Allowed operation**: `DELETE`
4. **Target roles**: `authenticated`
5. **Policy definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
6. **Click "Review"** then **"Save policy"**

---

## Step 3: Test Upload

1. **Go back to your app**
2. **Try uploading a pet image**
3. **Check console logs** - should see success message

---

## Alternative: SQL Commands (if you have admin access)

If you have admin privileges, you can run these SQL commands in the SQL Editor:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own pet images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own pet images" ON storage.objects;

-- Create policies
CREATE POLICY "Allow authenticated users to upload pet images" ON storage.objects
FOR INSERT TO authenticated
USING (bucket_id = 'pet-images');

CREATE POLICY "Allow authenticated users to view pet images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'pet-images');

CREATE POLICY "Allow users to update their own pet images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'pet-images');

CREATE POLICY "Allow users to delete their own pet images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'pet-images');
```

---

## Expected Result

After setting up the policies, you should see:
- ✅ File uploads work
- ✅ Images are stored in the bucket
- ✅ Public URLs are generated
- ✅ Images display on the home screen 