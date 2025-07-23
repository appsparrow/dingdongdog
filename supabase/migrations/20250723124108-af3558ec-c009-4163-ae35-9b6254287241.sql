
-- Insert admin user (Kiran / 4228) into profiles table
INSERT INTO public.profiles (
  id,
  name,
  short_name,
  phone_number,
  session_code,
  is_admin
) VALUES (
  gen_random_uuid(),
  'Kiran',
  'KR',
  '1234567890', -- assuming full phone number, last 4 digits will be 7890
  '4228',
  TRUE
);

-- Insert a sample schedule for this session
INSERT INTO public.schedules (
  session_code,
  feeding_instruction,
  walking_instruction,
  letout_instruction,
  letout_count
) VALUES (
  '4228',
  'Give 1 cup of kibble with treats',
  'Walk around the block for 15-20 minutes',
  'Let out for 5-10 minutes in the backyard',
  3
);
