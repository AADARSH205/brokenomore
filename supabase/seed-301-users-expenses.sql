-- ==============================================================================
-- BrokeNoMore: Seed 20 Expenses for ALL 301 Users (Lightning Fast & Safe)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uqnqqzldwhybdsaceafq/sql/new
--
-- Features:
-- 1. Creates public.expenses table with correct schema & RLS policies if not present
-- 2. Ensures all 301 users have active salary (₹65,000) & budget in public.profiles
-- 3. Seeds 20 realistic categorized Indian expenses for ALL 301 users in one fast query
-- 4. Idempotent: safe to run multiple times without creating duplicates
-- ==============================================================================

-- 1. Ensure public.expenses table exists
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  payment_method text DEFAULT 'UPI',
  date date DEFAULT current_date NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) & add safe policies
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Ensure public.profiles table exists & all 301 users have salary profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  salary numeric DEFAULT 50000,
  salary_day integer DEFAULT 1,
  fixed_bills numeric DEFAULT 20000,
  savings_goal numeric DEFAULT 10000,
  daily_safe_spend numeric DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

INSERT INTO public.profiles (id, email, full_name, salary, salary_day, fixed_bills, savings_goal, daily_safe_spend)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  65000,
  1,
  20000,
  15000,
  1000
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  salary = CASE WHEN public.profiles.salary IS NULL OR public.profiles.salary = 0 THEN 65000 ELSE public.profiles.salary END,
  fixed_bills = CASE WHEN public.profiles.fixed_bills IS NULL OR public.profiles.fixed_bills = 0 THEN 20000 ELSE public.profiles.fixed_bills END,
  savings_goal = CASE WHEN public.profiles.savings_goal IS NULL OR public.profiles.savings_goal = 0 THEN 15000 ELSE public.profiles.savings_goal END,
  daily_safe_spend = CASE WHEN public.profiles.daily_safe_spend IS NULL OR public.profiles.daily_safe_spend = 0 THEN 1000 ELSE public.profiles.daily_safe_spend END;

-- 4. Bulk insert 20 realistic expenses for EVERY user in auth.users (Instant single query for all 301 users)
INSERT INTO public.expenses (user_id, category, description, amount, payment_method, date, created_at)
SELECT 
  u.id,
  t.category,
  t.description,
  t.amount,
  t.payment_method,
  t.date::date,
  t.created_at::timestamptz
FROM auth.users u
CROSS JOIN (
  VALUES
    -- Current Month (November 2026)
    ('food', 'Swiggy Gourmet Dinner & Desserts', 540, 'upi', '2026-11-20', '2026-11-20 20:30:00+00'),
    ('groceries', 'Blinkit Quick Essentials & Milk', 680, 'upi', '2026-11-19', '2026-11-19 10:15:00+00'),
    ('transport', 'Uber Auto to Office', 185, 'upi', '2026-11-18', '2026-11-18 09:40:00+00'),
    ('food', 'Blue Tokai Cold Brew & Croissant', 340, 'card', '2026-11-17', '2026-11-17 16:20:00+00'),
    ('subscriptions', 'Netflix & Spotify Premium Family', 649, 'card', '2026-11-16', '2026-11-16 02:00:00+00'),
    ('shopping', 'Myntra Casual Weekend Wear', 1899, 'card', '2026-11-15', '2026-11-15 14:10:00+00'),
    ('food', 'Tapri Chai & Samosa with team', 90, 'upi', '2026-11-14', '2026-11-14 17:30:00+00'),
    ('food', 'Zomato Hyderabadi Biryani Feast', 620, 'upi', '2026-11-13', '2026-11-13 13:45:00+00'),
    ('bills', 'Airtel Xstream Fiber Broadband', 943, 'autopay', '2026-11-12', '2026-11-12 05:00:00+00'),
    ('entertainment', 'PVR IMAX Tickets & Cheese Popcorn', 880, 'upi', '2026-11-10', '2026-11-10 19:00:00+00'),
    ('medical', 'Apollo Pharmacy Multivitamins', 420, 'upi', '2026-11-08', '2026-11-08 11:20:00+00'),
    ('transport', 'Metro Smart Card Recharge', 500, 'upi', '2026-11-06', '2026-11-06 08:50:00+00'),
    ('groceries', 'Zepto Weekly Fresh Fruits & Veggies', 950, 'upi', '2026-11-04', '2026-11-04 18:25:00+00'),
    ('entertainment', 'Cult.fit Monthly Gym Pass', 1999, 'card', '2026-11-02', '2026-11-02 07:00:00+00'),
    ('rent', 'Shared Apartment Monthly Rent', 14500, 'netbanking', '2026-11-01', '2026-11-01 10:00:00+00'),
    -- Previous Month (October 2026) for Month-over-Month Comparison
    ('rent', 'Shared Apartment Monthly Rent', 14500, 'netbanking', '2026-10-01', '2026-10-01 10:00:00+00'),
    ('bills', 'Electricity & Wi-Fi Bill', 1920, 'autopay', '2026-10-10', '2026-10-10 05:00:00+00'),
    ('food', 'Dining Out & Food Deliveries', 6400, 'upi', '2026-10-15', '2026-10-15 21:00:00+00'),
    ('shopping', 'Diwali Festive Shopping & Gifts', 4800, 'card', '2026-10-22', '2026-10-22 15:30:00+00'),
    ('transport', 'Fuel, Uber & Commute', 2600, 'upi', '2026-10-28', '2026-10-28 18:00:00+00')
) AS t(category, description, amount, payment_method, date, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.expenses e 
  WHERE e.user_id = u.id AND e.description = t.description AND e.date = t.date::date
);

-- 5. Verification Query: see total expenses and users
SELECT 
  count(*) AS total_expenses_in_db,
  count(DISTINCT user_id) AS total_users_with_expenses,
  round(avg(amount)) AS avg_expense_amount
FROM public.expenses;
