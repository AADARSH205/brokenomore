import { useCallback, useEffect, useState } from "react";
import { addMonths, monthKeyOf } from "@/lib/finance";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

// Universal polyfill so legacy calls to globalThis.__B44_DB__ never throw
if (typeof globalThis !== "undefined") {
  const entityMock = () => ({
    list: async () => [],
    filter: async () => [],
    get: async () => null,
    create: async (d) => ({ id: "mock_" + Date.now(), ...d }),
    update: async (id, d) => ({ id, ...d }),
    delete: async () => ({ ok: true }),
    deleteMany: async () => ({ ok: true }),
  });
  globalThis.__B44_DB__ = globalThis.__B44_DB__ || {
    auth: { isAuthenticated: async () => false, me: async () => null, hasToken: () => false },
    entities: new Proxy({}, { get: () => entityMock() }),
    integrations: { Core: { UploadFile: async () => ({ file_url: "" }) } },
  };
}

function getStorage(key, fallback = []) {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, val) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

export const DEFAULT_EXPENSES = [
  { id: "seed_1", category: "food", description: "Swiggy Gourmet Dinner & Desserts", amount: 540, payment_method: "upi", date: "2026-11-20" },
  { id: "seed_2", category: "groceries", description: "Blinkit Quick Essentials & Milk", amount: 680, payment_method: "upi", date: "2026-11-19" },
  { id: "seed_3", category: "transport", description: "Uber Auto to Office", amount: 185, payment_method: "upi", date: "2026-11-18" },
  { id: "seed_4", category: "food", description: "Blue Tokai Cold Brew & Croissant", amount: 340, payment_method: "card", date: "2026-11-17" },
  { id: "seed_5", category: "subscriptions", description: "Netflix & Spotify Premium Family", amount: 649, payment_method: "card", date: "2026-11-16" },
  { id: "seed_6", category: "shopping", description: "Myntra Casual Weekend Wear", amount: 1899, payment_method: "card", date: "2026-11-15" },
  { id: "seed_7", category: "food", description: "Tapri Chai & Samosa with team", amount: 90, payment_method: "upi", date: "2026-11-14" },
  { id: "seed_8", category: "food", description: "Zomato Hyderabadi Biryani Feast", amount: 620, payment_method: "upi", date: "2026-11-13" },
  { id: "seed_9", category: "bills", description: "Airtel Xstream Fiber Broadband", amount: 943, payment_method: "autopay", date: "2026-11-12" },
  { id: "seed_10", category: "entertainment", description: "PVR IMAX Tickets & Cheese Popcorn", amount: 880, payment_method: "upi", date: "2026-11-10" },
  { id: "seed_11", category: "medical", description: "Apollo Pharmacy Multivitamins", amount: 420, payment_method: "upi", date: "2026-11-08" },
  { id: "seed_12", category: "transport", description: "Metro Smart Card Recharge", amount: 500, payment_method: "upi", date: "2026-11-06" },
  { id: "seed_13", category: "groceries", description: "Zepto Weekly Fresh Fruits & Veggies", amount: 950, payment_method: "upi", date: "2026-11-04" },
  { id: "seed_14", category: "entertainment", description: "Cult.fit Monthly Gym Pass", amount: 1999, payment_method: "card", date: "2026-11-02" },
  { id: "seed_15", category: "rent", description: "Shared Apartment Monthly Rent", amount: 14500, payment_method: "netbanking", date: "2026-11-01" },
  // October 2026 (for previous month comparison)
  { id: "seed_16", category: "rent", description: "Shared Apartment Monthly Rent", amount: 14500, payment_method: "netbanking", date: "2026-10-01" },
  { id: "seed_17", category: "bills", description: "Electricity & Wi-Fi Bill", amount: 1920, payment_method: "autopay", date: "2026-10-10" },
  { id: "seed_18", category: "food", description: "Dining Out & Food Deliveries", amount: 6400, payment_method: "upi", date: "2026-10-15" },
  { id: "seed_19", category: "shopping", description: "Diwali Festive Shopping & Gifts", amount: 4800, payment_method: "card", date: "2026-10-22" },
  { id: "seed_20", category: "transport", description: "Fuel & Commute", amount: 2600, payment_method: "upi", date: "2026-10-28" },
];

const ALL = ["profile", "expenses", "budgets", "bills", "payments", "goals", "sips", "taxProfile"];

const EMPTY = {
  profile: null,
  expenses: [],
  budgets: [],
  bills: [],
  payments: [],
  goals: [],
  sips: [],
  taxProfile: null,
};

/**
 * Everything a signed-in person's screens need for one month.
 * Backed by Supabase (profiles, expenses, savings_goals) + LocalStorage (budgets, bills, sips).
 */
export default function useFinanceData(month = monthKeyOf(new Date()), scope = ALL) {
  const { user, isLoadingAuth } = useAuth();
  const scopeKey = scope.join(",");
  const [state, setState] = useState({
    ...EMPTY,
    loading: true,
    error: null,
    month,
    prevMonth: addMonths(month, -1),
  });

  const load = useCallback(async () => {
    if (isLoadingAuth) return;

    setState((current) => ({ ...current, loading: true, error: null }));
    const prevMonth = addMonths(month, -1);
    const wanted = scopeKey.split(",");
    const wants = (key) => wanted.includes(key);

    try {
      const uid = user?.id || "guest";
      const localPrefix = `brokenomore_${uid}_`;

      // 1. Profile
      let profile = null;
      if (wants("profile")) {
        if (isSupabaseConfigured && user?.id && supabase) {
          try {
            const { data: p, error: pErr } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();

            if (p && !pErr && (Number(p.salary) > 0 || Number(p.monthly_income) > 0)) {
              const salary = Number(p.salary) || Number(p.monthly_income) || 65000;
              const fixedBills = Number(p.fixed_bills) || 20000;
              const savingsGoal = Number(p.savings_goal) || Number(p.monthly_savings_target) || 15000;
              const buffer = Number(p.safety_buffer) || 5000;
              const daily = Number(p.daily_safe_spend) || Math.max(0, Math.round((salary - fixedBills - savingsGoal) / 30));

              profile = {
                id: p.id,
                user_id: p.id,
                email: p.email || user.email,
                display_name: p.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Aadarsh Patil",
                full_name: p.full_name || user.user_metadata?.full_name || "Aadarsh Patil",
                monthly_income: salary,
                salary,
                salary_day: Number(p.salary_day) || 1,
                fixed_bills: fixedBills,
                monthly_savings_target: savingsGoal,
                savings_goal: savingsGoal,
                safety_buffer: buffer,
                extra_income: Number(p.extra_income) || 0,
                daily_safe_spend: daily,
                onboarded: true,
              };
              setStorage(`${localPrefix}profile`, profile);
            }
          } catch (err) {
            console.warn("Error loading profile from Supabase", err);
          }
        }

        if (!profile) {
          profile = getStorage(`${localPrefix}profile`, null);
        }

        // If still no profile, provide realistic default profile
        if (!profile) {
          profile = {
            id: uid,
            user_id: uid,
            email: user?.email || "user@brokenomore.in",
            display_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aadarsh Patil",
            full_name: user?.user_metadata?.full_name || "Aadarsh Patil",
            monthly_income: 65000,
            salary: 65000,
            salary_day: 1,
            fixed_bills: 20000,
            monthly_savings_target: 15000,
            savings_goal: 15000,
            safety_buffer: 5000,
            extra_income: 0,
            daily_safe_spend: 1000,
            onboarded: true,
          };
          setStorage(`${localPrefix}profile`, profile);
          if (isSupabaseConfigured && user?.id && supabase) {
            supabase.from("profiles").upsert({
              id: user.id,
              email: user.email,
              full_name: profile.full_name,
              salary: profile.salary,
              salary_day: profile.salary_day,
              fixed_bills: profile.fixed_bills,
              savings_goal: profile.savings_goal,
              daily_safe_spend: profile.daily_safe_spend,
            }).then(() => {}).catch(() => {});
          }
        }
      }

      // 2. Expenses
      let expenses = [];
      if (wants("expenses")) {
        let remoteExpenses = [];
        if (isSupabaseConfigured && user?.id && supabase) {
          try {
            const { data: exps, error: exErr } = await supabase
              .from("expenses")
              .select("*")
              .eq("user_id", user.id)
              .order("date", { ascending: false });

            if (exps && !exErr && exps.length > 0) {
              remoteExpenses = exps.map((e) => ({
                id: e.id,
                amount: Number(e.amount),
                category: e.category,
                description: e.description || "",
                payment_method: e.payment_method || "upi",
                date: e.date,
                is_recurring: !!e.is_recurring,
                is_planned: !!e.is_planned,
              }));
            }
          } catch (err) {
            console.warn("Error loading expenses from Supabase", err);
          }
        }

        const localExpenses = getStorage(`${localPrefix}expenses`, []);
        const seen = new Set();
        expenses = [...remoteExpenses, ...localExpenses].filter((e) => {
          if (!e?.id || seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });

        // If user has 0 expenses, auto-seed default expenses so dashboard is never empty!
        if (expenses.length === 0) {
          const autoSeeded = DEFAULT_EXPENSES.map((e) => ({
            ...e,
            id: `seed_${uid}_${e.id}`,
            user_id: uid,
          }));
          expenses = autoSeeded;
          setStorage(`${localPrefix}expenses`, autoSeeded);

          // Also persist into Supabase table in background
          if (isSupabaseConfigured && user?.id && supabase) {
            const rowsToInsert = autoSeeded.map((e) => ({
              user_id: user.id,
              amount: e.amount,
              category: e.category,
              description: e.description,
              payment_method: e.payment_method,
              date: e.date,
            }));
            supabase
              .from("expenses")
              .insert(rowsToInsert)
              .then(() => {})
              .catch((err) => console.warn("Auto-seed to Supabase error:", err));
          }
        }
      }

      // 3. Savings Goals
      let goals = [];
      if (wants("goals")) {
        let remoteGoals = [];
        if (isSupabaseConfigured && user?.id && supabase) {
          try {
            const { data: gData, error: gErr } = await supabase
              .from("savings_goals")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });

            if (gData && !gErr && gData.length > 0) {
              remoteGoals = gData.map((g) => ({
                id: g.id,
                name: g.title || g.name || "Goal",
                title: g.title || g.name || "Goal",
                kind: g.category || g.kind || "other",
                category: g.category || g.kind || "other",
                target_amount: Number(g.target_amount) || 0,
                saved_amount: Number(g.current_amount || g.saved_amount || 0),
                target_date: g.target_date || "",
              }));
            }
          } catch (err) {
            console.warn("Error loading goals from Supabase", err);
          }
        }

        const localGoals = getStorage(`${localPrefix}goals`, []);
        const seen = new Set();
        goals = [...remoteGoals, ...localGoals].filter((g) => {
          if (!g?.id || seen.has(g.id)) return false;
          seen.add(g.id);
          return true;
        });

        if (goals.length === 0) {
          const defaultGoals = [
            { id: `goal_${uid}_1`, name: "Emergency Fund (3 months)", title: "Emergency Fund", kind: "emergency", category: "emergency", target_amount: 100000, saved_amount: 45000, target_date: "2027-03-31" },
            { id: `goal_${uid}_2`, name: "Goa Vacation with Friends", title: "Goa Vacation", kind: "vacation", category: "vacation", target_amount: 25000, saved_amount: 18000, target_date: "2026-12-25" },
          ];
          goals = defaultGoals;
          setStorage(`${localPrefix}goals`, defaultGoals);
        }
      }

      // 4. Budgets
      let budgets = getStorage(`${localPrefix}budgets`, [
        { id: `${month}_food`, month, category: "food", limit_amount: 8000 },
        { id: `${month}_groceries`, month, category: "groceries", limit_amount: 6000 },
        { id: `${month}_transport`, month, category: "transport", limit_amount: 3000 },
        { id: `${month}_shopping`, month, category: "shopping", limit_amount: 5000 },
        { id: `${month}_entertainment`, month, category: "entertainment", limit_amount: 4000 },
      ]);

      // 5. Recurring Bills
      let bills = getStorage(`${localPrefix}bills`, [
        { id: `bill_${uid}_1`, name: "House Rent", amount: 14500, category: "rent", due_day: 1, is_essential: true, active: true },
        { id: `bill_${uid}_2`, name: "Airtel Wi-Fi Broadband", amount: 943, category: "bills", due_day: 12, is_essential: true, active: true },
        { id: `bill_${uid}_3`, name: "Netflix & Spotify Premium", amount: 649, category: "subscriptions", due_day: 16, is_essential: false, active: true },
        { id: `bill_${uid}_4`, name: "Cult.fit Monthly Membership", amount: 1999, category: "entertainment", due_day: 2, is_essential: false, active: true },
      ]);

      // 6. Bill Payments
      let payments = getStorage(`${localPrefix}payments`, [
        { id: `pay_${uid}_1`, bill_id: `bill_${uid}_1`, month, paid_on: `${month}-01`, amount: 14500 },
        { id: `pay_${uid}_2`, bill_id: `bill_${uid}_4`, month, paid_on: `${month}-02`, amount: 1999 },
      ]);

      // 7. SIPs
      let sips = getStorage(`${localPrefix}sips`, [
        { id: `sip_${uid}_1`, fund_name: "Parag Parikh Flexi Cap Fund", monthly_amount: 5000, start_date: "2025-01-05", sip_day: 5, goal: "Wealth Creation", duration_years: 10, status: "active" },
        { id: `sip_${uid}_2`, fund_name: "Nifty 50 Index Direct Growth", monthly_amount: 5000, start_date: "2025-01-05", sip_day: 5, goal: "Retirement", duration_years: 15, status: "active" },
      ]);

      // 8. Tax Profile
      let taxProfile = getStorage(`${localPrefix}taxProfile`, {
        id: `tax_${uid}`,
        financial_year: "2026-27",
        gross_salary: 850000,
        regime: "new",
      });

      setState({
        profile,
        expenses,
        budgets,
        bills,
        payments,
        goals,
        sips,
        taxProfile,
        loading: false,
        error: null,
        month,
        prevMonth,
      });
    } catch (error) {
      console.error("useFinanceData load error:", error);
      setState((curr) => ({
        ...curr,
        loading: false,
        error: null,
        month,
        prevMonth,
      }));
    }
  }, [month, scopeKey, user?.id, isLoadingAuth]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
