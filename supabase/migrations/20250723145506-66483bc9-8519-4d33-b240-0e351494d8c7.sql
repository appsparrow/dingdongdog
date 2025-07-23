
-- Drop the problematic RLS policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view profiles with same session code" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Create simpler, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to view profiles with the same session code (but avoid recursion)
CREATE POLICY "Users can view same session profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    session_code = (
      SELECT p.session_code 
      FROM public.profiles p 
      WHERE p.id = auth.uid() 
      LIMIT 1
    )
  );

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
      LIMIT 1
    )
  );

-- Allow admins to update profiles
CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
      LIMIT 1
    )
  );

-- Also update the activities policies to avoid potential recursion
DROP POLICY IF EXISTS "Users can view activities with same session code" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;

-- Recreate activities policies with better logic
CREATE POLICY "Users can view activities with same session code" 
  ON public.activities 
  FOR SELECT 
  USING (
    caretaker_id IN (
      SELECT p.id FROM public.profiles p 
      WHERE p.session_code = (
        SELECT p2.session_code FROM public.profiles p2 
        WHERE p2.id = auth.uid() 
        LIMIT 1
      )
    )
  );

CREATE POLICY "Users can insert their own activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (
    caretaker_id IN (
      SELECT p.id FROM public.profiles p 
      WHERE p.session_code = (
        SELECT p2.session_code FROM public.profiles p2 
        WHERE p2.id = auth.uid() 
        LIMIT 1
      )
    )
  );
