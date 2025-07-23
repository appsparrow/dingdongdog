
-- Create profiles table for caretakers
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  phone_number TEXT,
  session_code TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('feed', 'walk', 'letout')),
  time_period TEXT NOT NULL CHECK (time_period IN ('morning', 'afternoon', 'evening')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  caretaker_id UUID REFERENCES public.profiles(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedules table for storing feeding instructions and settings
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE,
  feeding_instruction TEXT DEFAULT 'Give 1 cup of kibble with treats',
  walking_instruction TEXT DEFAULT 'Walk around the block for 15-20 minutes',
  letout_instruction TEXT DEFAULT 'Let out for 5-10 minutes in the backyard',
  letout_count INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles (accessible by same session code)
CREATE POLICY "Users can view profiles with same session code" 
  ON public.profiles 
  FOR SELECT 
  USING (
    session_code IN (
      SELECT session_code FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create policies for activities (accessible by same session code)
CREATE POLICY "Users can view activities with same session code" 
  ON public.activities 
  FOR SELECT 
  USING (
    caretaker_id IN (
      SELECT id FROM public.profiles 
      WHERE session_code IN (
        SELECT session_code FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own activities" 
  ON public.activities 
  FOR INSERT 
  WITH CHECK (
    caretaker_id IN (
      SELECT id FROM public.profiles 
      WHERE session_code IN (
        SELECT session_code FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Create policies for schedules (accessible by same session code)
CREATE POLICY "Users can view schedules with same session code" 
  ON public.schedules 
  FOR SELECT 
  USING (
    session_code IN (
      SELECT session_code FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage schedules" 
  ON public.schedules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles table with metadata from auth
  INSERT INTO public.profiles (
    id, 
    name, 
    short_name, 
    session_code,
    is_admin
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'short_name', 'U'),
    COALESCE(NEW.raw_user_meta_data ->> 'session_code', 'DEFAULT'),
    COALESCE((NEW.raw_user_meta_data ->> 'is_admin')::boolean, FALSE)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
