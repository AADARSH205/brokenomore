-- BrokeNoMore Database Schema for Supabase
-- Copy and paste this into Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Profiles Table (linked to Supabase Auth)
create table if not exists public.profiles (
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

-- 2. Expenses Table
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  category text not null,
  description text default '',
  payment_method text default 'UPI',
  date date default current_date not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Savings Goals Table
create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0 not null,
  target_date date,
  category text default 'emergency',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.savings_goals enable row level security;

-- 5. RLS Policies (Users can only access their own data)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

create policy "Users can view own goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.savings_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

-- 6. Trigger: automatically create profile row when user signs up in Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
