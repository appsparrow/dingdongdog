-- Updated schema for DingDongDog with schedule times support

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.schedule_times CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  phone_number text NULL,
  session_code text NOT NULL,
  is_admin boolean NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Create schedules table (main schedule configuration)
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_code text NOT NULL,
  feeding_instruction text NULL DEFAULT 'Give 1/2 cup food and let him out before',
  walking_instruction text NULL DEFAULT 'Walk around the block for 15-20 minutes',
  letout_instruction text NULL DEFAULT 'Let out for 5-10 minutes in the backyard',
  letout_count integer NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_session_code_key UNIQUE (session_code)
);

-- Create schedule_times table (for specific times for each activity)
CREATE TABLE public.schedule_times (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
  activity_type text NOT NULL,
  time_period text NOT NULL,
  time_of_day text NOT NULL, -- 'morning', 'afternoon', 'evening'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT schedule_times_pkey PRIMARY KEY (id),
  CONSTRAINT schedule_times_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  CONSTRAINT schedule_times_activity_type_check CHECK (
    activity_type = ANY (ARRAY['feed'::text, 'walk'::text, 'letout'::text])
  ),
  CONSTRAINT schedule_times_time_period_check CHECK (
    time_period = ANY (ARRAY['morning'::text, 'afternoon'::text, 'evening'::text])
  ),
  CONSTRAINT schedule_times_time_of_day_check CHECK (
    time_of_day = ANY (ARRAY['morning'::text, 'afternoon'::text, 'evening'::text])
  )
);

-- Create activities table (for logging completed activities)
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL,
  time_period text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  caretaker_id uuid NOT NULL,
  notes text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_caretaker_id_fkey FOREIGN KEY (caretaker_id) REFERENCES profiles(id),
  CONSTRAINT activities_time_period_check CHECK (
    time_period = ANY (ARRAY['morning'::text, 'afternoon'::text, 'evening'::text])
  ),
  CONSTRAINT activities_type_check CHECK (
    type = ANY (ARRAY['feed'::text, 'walk'::text, 'letout'::text])
  )
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_session_code ON profiles(session_code);
CREATE INDEX idx_schedules_session_code ON schedules(session_code);
CREATE INDEX idx_schedule_times_schedule_id ON schedule_times(schedule_id);
CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activities_caretaker_id ON activities(caretaker_id);

-- Insert sample data for testing
INSERT INTO public.schedules (session_code, feeding_instruction, walking_instruction, letout_instruction, letout_count) 
VALUES ('8280', 'Give 1/2 cup food and let him out before', 'Walk around the block for 15-20 minutes', 'Let out for 5-10 minutes in the backyard', 3);

-- Insert sample schedule times
INSERT INTO public.schedule_times (schedule_id, activity_type, time_period, time_of_day)
SELECT 
  s.id,
  'feed',
  'morning',
  'morning'
FROM schedules s WHERE s.session_code = '8280'
UNION ALL
SELECT 
  s.id,
  'feed',
  'evening',
  'evening'
FROM schedules s WHERE s.session_code = '8280'
UNION ALL
SELECT 
  s.id,
  'walk',
  'morning',
  'morning'
FROM schedules s WHERE s.session_code = '8280'
UNION ALL
SELECT 
  s.id,
  'walk',
  'afternoon',
  'afternoon'
FROM schedules s WHERE s.session_code = '8280'
UNION ALL
SELECT 
  s.id,
  'walk',
  'evening',
  'evening'
FROM schedules s WHERE s.session_code = '8280';

-- Insert sample admin profile
INSERT INTO public.profiles (name, short_name, session_code, is_admin)
VALUES ('Admin User', 'AD', '8280', true);

-- Insert sample caretaker profiles
INSERT INTO public.profiles (name, short_name, session_code, is_admin)
VALUES 
  ('John Doe', 'JD', '8280', false),
  ('Jane Smith', 'JS', '8280', false); 