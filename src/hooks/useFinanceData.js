import { useCallback, useEffect, useState } from "react";
import { addMonths, monthKeyOf } from "@/lib/finance";
import { isSupabaseConfigured, supabase, supabaseGetUser } from "@/lib/supabase";

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
  const scopeKey = scope.join(",");
  const [state, setState] = useState({
    ...EMPTY,
    loading: true,
    error: null,
    month,
    prevMonth: addMonths(month, -1),
  });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const prevMonth = addMonths(month, -1);
    const wanted = scopeKey.split(",");
    const wants = (key) => wanted.includes(key);

    try {
      let user = null;
      if (isSupabaseConfigured) {
        try {
          user = await supabaseGetUser();
        } catch (e) {
          console.warn("Could not fetch Supabase user", e);
        }
      }

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

            if (p && !pErr) {
              const salary = Number(p.salary) || Number(p.monthly_income) || 0;
              const fixedBills = Number(p.fixed_bills) || 0;
              const savingsGoal = Number(p.savings_goal) || Number(p.monthly_savings_target) || 0;
              const buffer = Number(p.safety_buffer) || 5000;
              const daily = Number(p.daily_safe_spend) || Math.max(0, Math.round((salary - fixedBills - savingsGoal) / 30));

              profile = {
                id: p.id,
                user_id: p.id,
                email: p.email || user.email,
                display_name: p.full_name || user.email?.split("@")[0] || "User",
                full_name: p.full_name,
                monthly_income: salary,
                salary,
                salary_day: Number(p.salary_day) || 1,
                fixed_bills: fixedBills,
                monthly_savings_target: savingsGoal,
                savings_goal: savingsGoal,
                safety_buffer: buffer,
                extra_income: Number(p.extra_income) || 0,
                daily_safe_spend: daily,
                onboarded: salary > 0,
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

            if (exps && !exErr) {
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

            if (gData && !gErr) {
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
      }

      // 4. Budgets
      let budgets = [];
      if (wants("budgets")) {
        budgets = getStorage(`${localPrefix}budgets`, []);
      }

      // 5. Recurring Bills
      let bills = [];
      if (wants("bills")) {
        bills = getStorage(`${localPrefix}bills`, []);
      }

      // 6. Bill Payments
      let payments = [];
      if (wants("payments")) {
        payments = getStorage(`${localPrefix}payments`, []);
      }

      // 7. SIPs
      let sips = [];
      if (wants("sips")) {
        sips = getStorage(`${localPrefix}sips`, []);
      }

      // 8. Tax Profile
      let taxProfile = null;
      if (wants("taxProfile")) {
        taxProfile = getStorage(`${localPrefix}taxProfile`, null);
      }

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
  }, [month, scopeKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
