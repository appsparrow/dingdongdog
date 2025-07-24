# Manual Storage Bucket Setup Guide

## 🚫 **Why SQL Failed**
The error "must be owner of table objects" means you don't have admin privileges to modify the storage schema directly. This is a security feature in Supabase.

## ✅ **Solution: Use Supabase Dashboard**

### **Step 1: Access Storage in Dashboard**
1. **Go to your Supabase Dashboard**
2. **Select your project**
3. **Click "Storage"** in the left sidebar
4. **Click "Create a new bucket"**

### **Step 2: Create the Bucket**
1. **Bucket name**: `pet-images`
2. **Public bucket**: ✅ **Check this box**
3. **File size limit**: `5242880` (5MB)
4. **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`
5. **Click "Create bucket"**

### **Step 3: Set Up Storage Policies**
After creating the bucket, go to the **"Policies"** tab and add these policies:

#### **Policy 1: Allow Uploads**
- **Policy name**: `Allow authenticated users to upload pet images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'pet-images' AND auth.role() = 'authenticated')
```

#### **Policy 2: Allow Public Viewing**
- **Policy name**: `Allow public access to view pet images`
- **Target roles**: `anon, authenticated`
- **Policy definition**:
```sql
(bucket_id = 'pet-images')
```

#### **Policy 3: Allow Updates**
- **Policy name**: `Allow authenticated users to update pet images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'pet-images' AND auth.role() = 'authenticated')
```

#### **Policy 4: Allow Deletes**
- **Policy name**: `Allow authenticated users to delete pet images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'pet-images' AND auth.role() = 'authenticated')
```

### **Step 4: Verify Setup**
1. **Go back to your app**
2. **Click "Test Storage Access"**
3. **Should show**: "Found 1 buckets"
4. **Try uploading an image**

## 🔧 **Alternative: Use Supabase CLI**

If you have Supabase CLI installed, you can also create the bucket using:

```bash
supabase storage create-bucket pet-images --public
```

## 📋 **Quick Checklist**

- [ ] Created `pet-images` bucket in dashboard
- [ ] Set bucket as public
- [ ] Added upload policy for authenticated users
- [ ] Added view policy for public access
- [ ] Added update policy for authenticated users
- [ ] Added delete policy for authenticated users
- [ ] Tested storage access in app
- [ ] Successfully uploaded an image

## 🆘 **Need Help?**

If you're still having issues:
1. **Check bucket exists** in Storage section
2. **Verify policies** are correctly set
3. **Test with a small image** (under 1MB)
4. **Check console logs** for specific errors

The dashboard approach bypasses the permission restrictions and should work perfectly! 