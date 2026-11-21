// Finance data mutations for BrokeNoMore:
// Backed directly by Supabase (profiles, expenses, savings_goals) + LocalStorage (budgets, bills, sips, tax).
// Compatible with both direct execution and useServerFn caller.

import { z } from "zod";
import { isSupabaseConfigured, supabase, supabaseGetUser } from "@/lib/supabase";
import { CATEGORY_VALUES } from "@/lib/categories";

const category = z.enum(CATEGORY_VALUES);
const amount = z.number().min(0).max(100000000);
const positive = z.number().positive().max(100000000);
const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-20");
const monthKey = z.string().regex(/^\d{4}-\d{2}$/, "Use a month like 2026-11");
const id = z.string().min(1);

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

async function getUid() {
  if (isSupabaseConfigured) {
    try {
      const u = await supabaseGetUser();
      if (u?.id) return { id: u.id, email: u.email, user: u };
    } catch {}
  }
  return { id: "guest", email: "", user: null };
}

export const saveProfile = async ({ data }) => {
  const { id: uid, email } = await getUid();
  const salary = Number(data.monthly_income) || Number(data.salary) || 0;
  const salaryDay = Number(data.salary_day) || 1;
  const savingsGoal = Number(data.monthly_savings_target) || Number(data.savings_goal) || 0;
  const fixedBills = Number(data.fixed_bills) || 0;
  const buffer = Number(data.safety_buffer) || 5000;
  const extra = Number(data.extra_income) || 0;
  const daily = Math.max(0, Math.round((salary - fixedBills - savingsGoal) / 30));

  const profile = {
    id: uid,
    user_id: uid,
    email,
    display_name: data.display_name || email?.split("@")[0] || "User",
    full_name: data.display_name || "",
    monthly_income: salary,
    salary,
    salary_day: salaryDay,
    fixed_bills: fixedBills,
    monthly_savings_target: savingsGoal,
    savings_goal: savingsGoal,
    safety_buffer: buffer,
    extra_income: extra,
    daily_safe_spend: daily,
    onboarded: true,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("profiles").upsert({
        id: uid,
        email,
        full_name: profile.full_name,
        salary,
        salary_day: salaryDay,
        fixed_bills: fixedBills,
        savings_goal: savingsGoal,
        daily_safe_spend: daily,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Could not save profile to Supabase", e);
    }
  }

  setStorage(`brokenomore_${uid}_profile`, profile);
  return profile;
};

export const saveExpense = async ({ data }) => {
  const { id: uid } = await getUid();
  const expenseId = data.id || (typeof crypto !== "undefined" ? crypto.randomUUID() : "exp_" + Date.now());

  const payload = {
    id: expenseId,
    user_id: uid,
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
    description: data.description || "",
    payment_method: data.payment_method || "upi",
    is_recurring: !!data.is_recurring,
    is_planned: !!data.is_planned,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("expenses").upsert({
        id: payload.id,
        user_id: uid,
        amount: payload.amount,
        category: payload.category,
        description: payload.description,
        payment_method: payload.payment_method,
        date: payload.date,
      });
    } catch (e) {
      console.warn("Could not save expense to Supabase", e);
    }
  }

  const existing = getStorage(`brokenomore_${uid}_expenses`, []);
  const updated = [payload, ...existing.filter((e) => e.id !== expenseId)];
  setStorage(`brokenomore_${uid}_expenses`, updated);

  return payload;
};

export const deleteExpense = async ({ data }) => {
  const { id: uid } = await getUid();
  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("expenses").delete().eq("id", data.id);
    } catch (e) {
      console.warn("Could not delete expense from Supabase", e);
    }
  }

  const existing = getStorage(`brokenomore_${uid}_expenses`, []);
  setStorage(
    `brokenomore_${uid}_expenses`,
    existing.filter((e) => e.id !== data.id)
  );
  return { ok: true };
};

export const saveGoal = async ({ data }) => {
  const { id: uid } = await getUid();
  const goalId = data.id || (typeof crypto !== "undefined" ? crypto.randomUUID() : "goal_" + Date.now());

  const payload = {
    id: goalId,
    user_id: uid,
    name: data.name,
    title: data.name,
    kind: data.kind || "other",
    category: data.kind || "other",
    target_amount: Number(data.target_amount),
    saved_amount: Number(data.saved_amount) || 0,
    target_date: data.target_date || "",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("savings_goals").upsert({
        id: payload.id,
        user_id: uid,
        title: payload.title,
        target_amount: payload.target_amount,
        current_amount: payload.saved_amount,
        target_date: payload.target_date || null,
        category: payload.category,
      });
    } catch (e) {
      console.warn("Could not save goal to Supabase", e);
    }
  }

  const existing = getStorage(`brokenomore_${uid}_goals`, []);
  const updated = [payload, ...existing.filter((g) => g.id !== goalId)];
  setStorage(`brokenomore_${uid}_goals`, updated);

  return payload;
};

export const addToGoal = async ({ data }) => {
  const { id: uid } = await getUid();
  const existing = getStorage(`brokenomore_${uid}_goals`, []);
  const goal = existing.find((g) => g.id === data.id);
  const next = goal
    ? Math.min(Number(goal.target_amount) || 0, (Number(goal.saved_amount) || 0) + Number(data.amount))
    : Number(data.amount);

  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("savings_goals").update({ current_amount: next }).eq("id", data.id);
    } catch (e) {
      console.warn("Could not add to goal in Supabase", e);
    }
  }

  const updated = existing.map((g) => (g.id === data.id ? { ...g, saved_amount: next } : g));
  setStorage(`brokenomore_${uid}_goals`, updated);
  return { ok: true, saved_amount: next };
};

export const deleteGoal = async ({ data }) => {
  const { id: uid } = await getUid();
  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("savings_goals").delete().eq("id", data.id);
    } catch (e) {
      console.warn("Could not delete goal from Supabase", e);
    }
  }

  const existing = getStorage(`brokenomore_${uid}_goals`, []);
  setStorage(
    `brokenomore_${uid}_goals`,
    existing.filter((g) => g.id !== data.id)
  );
  return { ok: true };
};

export const saveBill = async ({ data }) => {
  const { id: uid } = await getUid();
  const billId = data.id || (typeof crypto !== "undefined" ? crypto.randomUUID() : "bill_" + Date.now());
  const payload = {
    id: billId,
    name: data.name,
    amount: Number(data.amount),
    category: data.category || "bills",
    due_day: Number(data.due_day) || 1,
    is_essential: data.is_essential !== false,
    active: data.active !== false,
  };
  const existing = getStorage(`brokenomore_${uid}_bills`, []);
  const updated = [payload, ...existing.filter((b) => b.id !== billId)];
  setStorage(`brokenomore_${uid}_bills`, updated);
  return payload;
};

export const deleteBill = async ({ data }) => {
  const { id: uid } = await getUid();
  const existing = getStorage(`brokenomore_${uid}_bills`, []);
  setStorage(
    `brokenomore_${uid}_bills`,
    existing.filter((b) => b.id !== data.id)
  );
  return { ok: true };
};

export const setBillPaid = async ({ data }) => {
  const { id: uid } = await getUid();
  const bills = getStorage(`brokenomore_${uid}_bills`, []);
  const bill = bills.find((b) => b.id === data.bill_id);
  const payments = getStorage(`brokenomore_${uid}_payments`, []);

  if (!data.paid) {
    const existingPayment = payments.find((p) => p.bill_id === data.bill_id && p.month === data.month);
    if (existingPayment?.expense_id) {
      await deleteExpense({ data: { id: existingPayment.expense_id } });
    }
    setStorage(
      `brokenomore_${uid}_payments`,
      payments.filter((p) => !(p.bill_id === data.bill_id && p.month === data.month))
    );
    return { ok: true };
  }

  const paidOn = data.paid_on || new Date().toISOString().slice(0, 10);
  let expenseId = null;
  if (bill) {
    const exp = await saveExpense({
      data: {
        amount: bill.amount,
        category: bill.category || "bills",
        date: paidOn,
        description: `${bill.name} (bill)`,
        payment_method: "autopay",
        is_recurring: true,
      },
    });
    expenseId = exp?.id;
  }

  const newPayment = {
    id: "pay_" + Date.now(),
    bill_id: data.bill_id,
    month: data.month,
    paid_on: paidOn,
    amount: bill ? bill.amount : 0,
    expense_id: expenseId,
  };
  setStorage(`brokenomore_${uid}_payments`, [newPayment, ...payments]);
  return { ok: true, expense_id: expenseId };
};

export const saveBudget = async ({ data }) => {
  const { id: uid } = await getUid();
  const budgets = getStorage(`brokenomore_${uid}_budgets`, []);
  if (data.limit_amount === 0) {
    setStorage(
      `brokenomore_${uid}_budgets`,
      budgets.filter((b) => !(b.month === data.month && b.category === data.category))
    );
    return { ok: true, removed: true };
  }
  const payload = {
    id: `${data.month}_${data.category}`,
    month: data.month,
    category: data.category,
    limit_amount: Number(data.limit_amount),
  };
  const updated = [payload, ...budgets.filter((b) => !(b.month === data.month && b.category === data.category))];
  setStorage(`brokenomore_${uid}_budgets`, updated);
  return payload;
};

export const saveSip = async ({ data }) => {
  const { id: uid } = await getUid();
  const sipId = data.id || (typeof crypto !== "undefined" ? crypto.randomUUID() : "sip_" + Date.now());
  const payload = {
    id: sipId,
    fund_name: data.fund_name,
    monthly_amount: Number(data.monthly_amount),
    start_date: data.start_date,
    sip_day: Number(data.sip_day) || 5,
    goal: data.goal || "",
    duration_years: Number(data.duration_years) || 10,
    status: data.status || "active",
  };
  const existing = getStorage(`brokenomore_${uid}_sips`, []);
  const updated = [payload, ...existing.filter((s) => s.id !== sipId)];
  setStorage(`brokenomore_${uid}_sips`, updated);
  return payload;
};

export const deleteSip = async ({ data }) => {
  const { id: uid } = await getUid();
  const existing = getStorage(`brokenomore_${uid}_sips`, []);
  setStorage(
    `brokenomore_${uid}_sips`,
    existing.filter((s) => s.id !== data.id)
  );
  return { ok: true };
};

export const saveTaxProfile = async ({ data }) => {
  const { id: uid } = await getUid();
  const payload = {
    id: data.id || "tax_" + data.financial_year,
    ...data,
  };
  setStorage(`brokenomore_${uid}_taxProfile`, payload);
  return payload;
};

export const exportMyData = async () => {
  const { id: uid } = await getUid();
  return {
    exported_at: new Date().toISOString(),
    profile: getStorage(`brokenomore_${uid}_profile`, null),
    expenses: getStorage(`brokenomore_${uid}_expenses`, []),
    goals: getStorage(`brokenomore_${uid}_goals`, []),
    bills: getStorage(`brokenomore_${uid}_bills`, []),
    budgets: getStorage(`brokenomore_${uid}_budgets`, []),
    sips: getStorage(`brokenomore_${uid}_sips`, []),
  };
};

export const clearMyData = async () => {
  const { id: uid } = await getUid();
  if (isSupabaseConfigured && uid !== "guest" && supabase) {
    try {
      await supabase.from("expenses").delete().eq("user_id", uid);
      await supabase.from("savings_goals").delete().eq("user_id", uid);
    } catch {}
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(`brokenomore_${uid}_profile`);
    localStorage.removeItem(`brokenomore_${uid}_expenses`);
    localStorage.removeItem(`brokenomore_${uid}_goals`);
    localStorage.removeItem(`brokenomore_${uid}_bills`);
    localStorage.removeItem(`brokenomore_${uid}_payments`);
    localStorage.removeItem(`brokenomore_${uid}_budgets`);
    localStorage.removeItem(`brokenomore_${uid}_sips`);
    localStorage.removeItem(`brokenomore_${uid}_taxProfile`);
  }
  return { ok: true };
};
