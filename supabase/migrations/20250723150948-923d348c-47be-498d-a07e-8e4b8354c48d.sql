
-- First, let's create a security definer function to get the current user's session code
CREATE OR REPLACE FUNCTION public.get_current_user_session_code()
RETURNS TEXT AS $$
  SELECT session_code FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view same session profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create a simpler policy for viewing profiles in the same session
CREATE POLICY "Users can view same session profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    session_code = public.get_current_user_session_code()
    OR auth.uid() = id
  );

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, FALSE) FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.is_current_user_admin() = TRUE);

-- Allow admins to update profiles
CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_current_user_admin() = TRUE);

-- Also fix the activities policies
DROP POLICY IF EXISTS "Users can view activities with same session code" ON public.activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;

-- Recreate activities policies using the security definer function
CREATE POLICY "Users can view activities with same session code" 
  ON public.activities 
  FOR SELECT 
  USING (
    caretaker_id IN (
      SELECT id FROM public.profiles 
      WHERE session_code = public.get_current_user_session_code()
    )
  );

CREATE POLICY "Users can insert their own activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (
    caretaker_id IN (
      SELECT id FROM public.profiles 
      WHERE session_code = public.get_current_user_session_code()
    )
  );
