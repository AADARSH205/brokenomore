-- ==============================================================================
-- BrokeNoMore: Seed 100 Users directly into Supabase Authentication -> Users
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uqnqqzldwhybdsaceafq/sql/new
--
-- Features:
-- 1. Inserts into auth.users (Appears directly in Authentication -> Users table)
-- 2. Inserts into auth.identities with provider_id (Allows login with email + password)
-- 3. Inserts into public.profiles (Contains salary, savings goal, safe-to-spend)
-- 4. Password for all 100 accounts: Password@123
-- ==============================================================================

-- 1. Ensure pgcrypto extension and search path are set
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SET search_path = public, extensions, auth;

-- 2. Ensure public.profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  salary numeric default 50000,
  salary_day integer default 1,
  fixed_bills numeric default 20000,
  savings_goal numeric default 10000,
  daily_safe_spend numeric default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Loop and generate 100 realistic users
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
  encrypted_pw TEXT;
BEGIN
  -- Generate bcrypt hash for Password@123
  BEGIN
    encrypted_pw := crypt('Password@123', gen_salt('bf'));
  EXCEPTION WHEN OTHERS THEN
    encrypted_pw := extensions.crypt('Password@123', extensions.gen_salt('bf'));
  END;

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

    -- 1. Insert into auth.users (Authentication -> Users)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      user_email,
      encrypted_pw,
      now() - (interval '1 day' * (i % 25)),
      now(),
      now() - (interval '1 hour' * (i % 48)),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', user_name),
      now() - (interval '1 day' * (i % 30)),
      now(),
      '',
      '',
      '',
      ''
    )
    ON CONFLICT DO NOTHING;

    -- 2. Insert into auth.identities (Required by Supabase for email login)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_uid,
      format('{"sub": "%s", "email": "%s"}', new_uid::text, user_email)::jsonb,
      'email',
      new_uid::text,
      now(),
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;

    -- 3. Insert into public.profiles (Profile & Salary details)
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      salary,
      salary_day,
      fixed_bills,
      savings_goal,
      daily_safe_spend,
      created_at,
      updated_at
    ) VALUES (
      new_uid,
      user_email,
      user_name,
      user_salary,
      1 + (floor(random() * 5))::int,
      user_bills,
      user_goal,
      user_daily,
      now() - (interval '1 day' * (i % 30)),
      now()
    )
    ON CONFLICT DO NOTHING;

  END LOOP;
END $$;

-- 4. Verification Query: Returns the total count of users in Authentication
SELECT count(*) AS total_auth_users FROM auth.users;
