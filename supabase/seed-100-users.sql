-- BrokeNoMore: Seed 100 Realistic Users into Supabase Auth & Profiles
-- Copy and paste this into Supabase SQL Editor and click RUN.
-- All 100 users can log in with password: Password@123

DO $$
DECLARE
  i INTEGER;
  new_uid UUID;
  user_email TEXT;
  user_name TEXT;
  first_names TEXT[] := ARRAY['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Kabir', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Angel', 'Riya', 'Myra', 'Sara', 'Ira', 'Avani', 'Aditi', 'Meera', 'Rohan', 'Tanvi', 'Karan', 'Pooja', 'Nikhil'];
  last_names TEXT[] := ARRAY['Sharma', 'Verma', 'Patel', 'Iyer', 'Reddy', 'Nair', 'Mehta', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Chopra', 'Rao', 'Bhat', 'Deshmukh', 'Kulkarni', 'Malhotra', 'Aggarwal'];
  fn TEXT;
  ln TEXT;
  user_salary NUMERIC;
  user_bills NUMERIC;
  user_goal NUMERIC;
  user_daily NUMERIC;
BEGIN
  FOR i IN 1..100 LOOP
    new_uid := gen_random_uuid();
    fn := first_names[1 + floor(random() * array_length(first_names, 1))::int];
    ln := last_names[1 + floor(random() * array_length(last_names, 1))::int];
    user_name := fn || ' ' || ln;
    user_email := lower(fn) || '.' || lower(ln) || i || '@brokenomore.in';
    
    user_salary := 35000 + (floor(random() * 12) * 5000);  -- ₹35,000 to ₹90,000
    user_bills  := 15000 + (floor(random() * 6) * 2000);   -- ₹15,000 to ₹25,000
    user_goal   := 5000 + (floor(random() * 5) * 2000);    -- ₹5,000 to ₹13,000
    user_daily  := round((user_salary - user_bills - user_goal) / 30); -- Safe to spend

    -- 1. Insert into Supabase Auth table (pre-confirmed with password 'Password@123')
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      last_sign_in_at
    ) VALUES (
      new_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      user_email,
      crypt('Password@123', gen_salt('bf')),
      now() - (interval '1 day' * (i % 25)),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', user_name),
      now() - (interval '1 day' * (i % 30)),
      now(),
      now() - (interval '1 hour' * (i % 48))
    )
    ON CONFLICT (email) DO NOTHING;

    -- 2. Insert into BrokeNoMore Profiles table
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      salary,
      salary_day,
      fixed_bills,
      savings_goal,
      daily_safe_spend
    ) VALUES (
      new_uid,
      user_email,
      user_name,
      user_salary,
      1 + (floor(random() * 5))::int,
      user_bills,
      user_goal,
      user_daily
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      salary = EXCLUDED.salary,
      daily_safe_spend = EXCLUDED.daily_safe_spend;

  END LOOP;
END $$;
