-- ==============================================================================
-- BrokeNoMore: Seed 15+ Realistic Expenses per User for ALL Users in Supabase
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uqnqqzldwhybdsaceafq/sql/new
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

-- 2. Ensure RLS is enabled and policies exist
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

-- 3. Loop and seed expenses for EVERY user
DO $$
DECLARE
  u RECORD;
BEGIN
  -- Ensure all users have active profiles
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

  FOR u IN SELECT id FROM auth.users LOOP
    
    -- November 2026 Expenses (Current Month)
    INSERT INTO public.expenses (user_id, category, description, amount, payment_method, date, created_at)
    VALUES
      (u.id, 'food', 'Swiggy Gourmet Dinner & Desserts', 540, 'upi', '2026-11-20', '2026-11-20 20:30:00+00'),
      (u.id, 'groceries', 'Blinkit Quick Essentials & Milk', 680, 'upi', '2026-11-19', '2026-11-19 10:15:00+00'),
      (u.id, 'transport', 'Uber Auto to Office', 185, 'upi', '2026-11-18', '2026-11-18 09:40:00+00'),
      (u.id, 'food', 'Blue Tokai Cold Brew & Croissant', 340, 'card', '2026-11-17', '2026-11-17 16:20:00+00'),
      (u.id, 'subscriptions', 'Netflix & Spotify Premium Family', 649, 'card', '2026-11-16', '2026-11-16 02:00:00+00'),
      (u.id, 'shopping', 'Myntra Casual Weekend Wear', 1899, 'card', '2026-11-15', '2026-11-15 14:10:00+00'),
      (u.id, 'food', 'Tapri Chai & Samosa with team', 90, 'upi', '2026-11-14', '2026-11-14 17:30:00+00'),
      (u.id, 'food', 'Zomato Hyderabadi Biryani Feast', 620, 'upi', '2026-11-13', '2026-11-13 13:45:00+00'),
      (u.id, 'bills', 'Airtel Xstream Fiber Broadband', 943, 'autopay', '2026-11-12', '2026-11-12 05:00:00+00'),
      (u.id, 'entertainment', 'PVR IMAX Tickets & Cheese Popcorn', 880, 'upi', '2026-11-10', '2026-11-10 19:00:00+00'),
      (u.id, 'medical', 'Apollo Pharmacy Multivitamins', 420, 'upi', '2026-11-08', '2026-11-08 11:20:00+00'),
      (u.id, 'transport', 'Metro Smart Card Recharge', 500, 'upi', '2026-11-06', '2026-11-06 08:50:00+00'),
      (u.id, 'groceries', 'Zepto Weekly Fresh Fruits & Veggies', 950, 'upi', '2026-11-04', '2026-11-04 18:25:00+00'),
      (u.id, 'entertainment', 'Cult.fit Monthly Gym Pass', 1999, 'card', '2026-11-02', '2026-11-02 07:00:00+00'),
      (u.id, 'rent', 'Shared Apartment Monthly Rent', 14500, 'netbanking', '2026-11-01', '2026-11-01 10:00:00+00');

    -- October 2026 Expenses (for Month-over-Month Comparison)
    INSERT INTO public.expenses (user_id, category, description, amount, payment_method, date, created_at)
    VALUES
      (u.id, 'rent', 'Shared Apartment Monthly Rent', 14500, 'netbanking', '2026-10-01', '2026-10-01 10:00:00+00'),
      (u.id, 'bills', 'Electricity & Wi-Fi Bill', 1920, 'autopay', '2026-10-10', '2026-10-10 05:00:00+00'),
      (u.id, 'food', 'Dining Out & Food Deliveries', 6400, 'upi', '2026-10-15', '2026-10-15 21:00:00+00'),
      (u.id, 'shopping', 'Diwali Festive Shopping & Gifts', 4800, 'card', '2026-10-22', '2026-10-22 15:30:00+00'),
      (u.id, 'transport', 'Fuel, Uber & Commute', 2600, 'upi', '2026-10-28', '2026-10-28 18:00:00+00');

  END LOOP;
END $$;

-- 4. Verification Query
SELECT 
  count(*) AS total_expenses_seeded,
  count(DISTINCT user_id) AS total_users_with_expenses,
  round(avg(amount)) AS avg_expense_amount
FROM public.expenses;
