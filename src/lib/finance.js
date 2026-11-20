// Pure finance logic for the dashboard: salary cycle, safe-to-spend, budgets,
// goals and the daily insights. No React and no browser APIs, so tests/finance.test.mjs
// can run it directly with node.
import { toAmount } from "./money.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const pad = (value) => String(value).padStart(2, "0");

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(now = new Date()) {
  return toDateKey(now);
}

export function monthKeyOf(value = new Date()) {
  if (typeof value === "string") return value.slice(0, 7);
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`;
}

export function daysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function monthShortLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

export function addMonths(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function monthBounds(monthKey) {
  return { start: `${monthKey}-01`, end: `${monthKey}-${pad(daysInMonth(monthKey))}` };
}

/** Days from one date key to another; positive when `to` is later. */
export function daysBetween(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

/**
 * The salary cycle running right now: from the last payday to the next one.
 * daysLeft counts today, so a 30-day month spent on day one gives 30.
 */
export function salaryCycle(now = new Date(), salaryDay = 1) {
  const day = Math.min(31, Math.max(1, Math.floor(Number(salaryDay) || 1)));
  const clamped = (year, month, wanted) => {
    const last = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(wanted, last));
  };

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start = clamped(today.getFullYear(), today.getMonth(), day);
  if (start > today) start = clamped(today.getFullYear(), today.getMonth() - 1, day);
  let end = clamped(today.getFullYear(), today.getMonth(), day);
  if (end <= today) end = clamped(today.getFullYear(), today.getMonth() + 1, day);

  return {
    startKey: toDateKey(start),
    endKey: toDateKey(end),
    daysLeft: Math.max(1, Math.round((end - today) / DAY_MS)),
    daysElapsed: Math.max(1, Math.round((today - start) / DAY_MS) + 1),
    monthKey: monthKeyOf(start),
  };
}

export function inCycle(dateKey, cycle) {
  return Boolean(dateKey) && dateKey >= cycle.startKey && dateKey < cycle.endKey;
}

export function sumExpenses(expenses = []) {
  return expenses.reduce((total, item) => total + toAmount(item?.amount), 0);
}

export function expensesInMonth(expenses = [], monthKey) {
  return expenses.filter((item) => String(item?.date ?? "").startsWith(monthKey));
}

export function expensesInCycle(expenses = [], cycle) {
  return expenses.filter((item) => inCycle(item?.date, cycle));
}

/**
 * Safe to spend today = what is left after savings, the safety buffer, unpaid
 * essential bills and everything already recorded, spread over the days left.
 * Each rupee is subtracted once: a bill leaves this pool when it is marked paid,
 * because paying it creates an expense record.
 */
export function safeToSpend({
  income = 0,
  extraIncome = 0,
  savingsTarget = 0,
  safetyBuffer = 0,
  unpaidBills = 0,
  spent = 0,
  daysLeft = 1,
}) {
  const inHand = toAmount(income) + toAmount(extraIncome);
  const savings = toAmount(savingsTarget);
  const buffer = toAmount(safetyBuffer);
  const bills = toAmount(unpaidBills);
  const alreadySpent = toAmount(spent);
  const pool = inHand - savings - buffer - bills - alreadySpent;
  const days = Math.max(1, Math.floor(Number(daysLeft) || 1));
  const base = {
    inHand,
    savings,
    buffer,
    bills,
    spent: alreadySpent,
    pool,
    days,
    shortfall: 0,
  };

  if (pool <= 0) {
    return { ...base, perDay: 0, status: "shortfall", shortfall: Math.abs(pool) };
  }

  return { ...base, perDay: Math.floor(pool / days), status: "ok" };
}

export function budgetStatus(limit, spent) {
  const cap = toAmount(limit);
  const used = toAmount(spent);
  const remaining = cap - used;
  const pct = cap > 0 ? Math.round((used / cap) * 100) : used > 0 ? 100 : 0;
  const state = cap <= 0 ? "none" : used > cap ? "over" : pct >= 80 ? "watch" : "ok";
  // Three checkpoints the planner warns on: half used, 80% used, over the limit.
  const level = cap <= 0 ? "none" : used > cap ? "over" : pct >= 80 ? "watch" : pct >= 50 ? "half" : "ok";
  return { limit: cap, spent: used, remaining, pct, state, level };
}

export function totalsByCategory(expenses = []) {
  const totals = {};
  for (const item of expenses) {
    const key = item?.category || "other";
    totals[key] = (totals[key] ?? 0) + toAmount(item?.amount);
  }
  return totals;
}

export function categoryTotalsList(expenses = []) {
  const totals = totalsByCategory(expenses);
  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function largestExpenses(expenses = [], count = 5) {
  return [...expenses].sort((a, b) => toAmount(b?.amount) - toAmount(a?.amount)).slice(0, count);
}

/** Last `days` days of spending, oldest first, for the weekly bar chart. */
export function dailyTotals(expenses = [], days = 7, now = new Date()) {
  const out = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const key = toDateKey(date);
    const total = expenses
      .filter((item) => item?.date === key)
      .reduce((sum, item) => sum + toAmount(item?.amount), 0);
    out.push({
      key,
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" }).format(
        new Date(`${key}T00:00:00Z`),
      ),
      total,
    });
  }
  return out;
}

/** Last `months` months of spending, oldest first, for the monthly bar chart. */
export function monthlyTotals(expenses = [], months = 6, now = new Date()) {
  const out = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const key = addMonths(monthKeyOf(now), -offset);
    const total = expenses
      .filter((item) => String(item?.date ?? "").startsWith(key))
      .reduce((sum, item) => sum + toAmount(item?.amount), 0);
    out.push({ key, label: monthShortLabel(key), total });
  }
  return out;
}

export function monthsBetween(fromKey, toKey) {
  if (!toKey) return 0;
  const [fy, fm] = fromKey.split("-").map(Number);
  const [ty, tm] = toKey.split("-").map(Number);
  const months = (ty - fy) * 12 + (tm - fm);
  return Math.max(0, months);
}

export function goalProgress(goal, today = todayKey()) {
  const target = toAmount(goal?.target_amount);
  const saved = Math.min(toAmount(goal?.saved_amount), target);
  const remaining = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const monthsLeft = goal?.target_date ? Math.max(1, monthsBetween(today.slice(0, 7), String(goal.target_date).slice(0, 7))) : 0;
  const suggestedMonthly = remaining === 0 ? 0 : monthsLeft > 0 ? Math.ceil(remaining / monthsLeft) : remaining;
  return { target, saved, remaining, pct, monthsLeft, suggestedMonthly, done: remaining === 0 };
}

export function sipTotals(sips = []) {
  const active = sips.filter((sip) => sip?.status !== "paused");
  const monthly = active.reduce((sum, sip) => sum + toAmount(sip?.monthly_amount), 0);
  return { monthly, activeCount: active.length, pausedCount: sips.length - active.length };
}

/** Instalments already gone out for one SIP, based on its start date. */
export function sipInstalments(sip, today = todayKey()) {
  const start = String(sip?.start_date ?? today);
  if (start > today) return 0;
  const months = monthsBetween(start.slice(0, 7), today.slice(0, 7));
  const day = Math.min(31, Math.max(1, Number(sip?.sip_day) || Number(start.slice(8, 10)) || 1));
  const passedThisMonth = Number(today.slice(8, 10)) >= day ? 1 : 0;
  return months + passedThisMonth;
}

export function sipInvested(sip, today = todayKey()) {
  return sipInstalments(sip, today) * toAmount(sip?.monthly_amount);
}

export function nextSipDate(sip, today = todayKey()) {
  const day = Math.min(31, Math.max(1, Number(sip?.sip_day) || Number(String(sip?.start_date ?? today).slice(8, 10)) || 1));
  const [year, month] = today.split("-").map(Number);
  const thisMonth = new Date(year, month - 1, Math.min(day, daysInMonth(today.slice(0, 7))));
  const next = toDateKey(thisMonth) >= today ? thisMonth : new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));
  return toDateKey(next);
}

/**
 * Friendly, data-driven lines for the dashboard. Never judgemental: every
 * warning comes with a number the person can act on.
 */
export function buildInsights({
  profile,
  cycle,
  expenses = [],
  prevExpenses = [],
  budgets = [],
  bills = [],
  payments = [],
  goals = [],
  sips = [],
  today = todayKey(),
}) {
  const insights = [];
  const spent = sumExpenses(expensesInCycle(expenses, cycle));
  const income = toAmount(profile?.monthly_income) + toAmount(profile?.extra_income);
  const pct = income > 0 ? Math.round((spent / income) * 100) : 0;

  if (income > 0 && spent > 0) {
    const saved = income - spent;
    if (pct >= 100) {
      insights.push({
        tone: "warn",
        text: `You have spent ${pct}% of this month's take-home. The next payday is ${cycle.daysLeft} day${cycle.daysLeft === 1 ? "" : "s"} away, so keep the rest to essentials.`,
      });
    } else if (saved >= toAmount(profile?.monthly_savings_target) && toAmount(profile?.monthly_savings_target) > 0) {
      insights.push({
        tone: "good",
        text: `You have spent ${pct}% of your budget and you are on track to save about ₹${Math.round(saved).toLocaleString("en-IN")} this month.`,
      });
    } else {
      insights.push({
        tone: "info",
        text: `You have spent ${pct}% of this month's budget with ${cycle.daysLeft} day${cycle.daysLeft === 1 ? "" : "s"} to go.`,
      });
    }
  }

  // Biggest category jump against last month, turned into a weekly target.
  const current = totalsByCategory(expensesInCycle(expenses, cycle));
  const previous = totalsByCategory(prevExpenses);
  let jump = null;
  for (const [category, total] of Object.entries(current)) {
    const before = previous[category] ?? 0;
    const delta = total - before;
    if (before > 0 && delta > 300 && (!jump || delta > jump.delta)) jump = { category, delta };
  }
  if (jump) {
    const weekly = Math.max(50, Math.round(jump.delta / 4 / 50) * 50);
    insights.push({
      tone: "warn",
      text: `You spent ₹${jump.delta.toLocaleString("en-IN")} more on ${jump.category} than last month. Trimming ₹${weekly.toLocaleString("en-IN")} a week would save about ₹${(weekly * 4).toLocaleString("en-IN")} next month.`,
    });
  }

  const paidBillIds = new Set(payments.map((payment) => payment?.bill_id));
  const dueSoon = bills
    .filter((bill) => bill?.active !== false && !paidBillIds.has(bill.id))
    .filter((bill) => {
      const due = Number(bill?.due_day) || 1;
      return due - Number(today.slice(8, 10)) >= 0 && due - Number(today.slice(8, 10)) <= 7;
    })
    .sort((a, b) => Number(a.due_day) - Number(b.due_day));
  if (dueSoon.length > 0) {
    const bill = dueSoon[0];
    insights.push({
      tone: "info",
      text: `${bill.name} of ₹${toAmount(bill.amount).toLocaleString("en-IN")} is due on the ${bill.due_day}${bill.due_day === 1 ? "st" : bill.due_day === 2 ? "nd" : bill.due_day === 3 ? "rd" : "th"}. It is already held back from today's number.`,
    });
  }

  const overBudget = budgets
    .map((budget) => ({ budget, status: budgetStatus(budget.limit_amount, current[budget.category] ?? 0) }))
    .filter((row) => row.status.state === "over")
    .sort((a, b) => b.status.remaining * -1 + a.status.remaining)[0];
  if (overBudget) {
    insights.push({
      tone: "warn",
      text: `Your ${overBudget.budget.category} budget is over by ₹${Math.abs(overBudget.status.remaining).toLocaleString("en-IN")}. Move a little from another category or pause that spend until payday.`,
    });
  }

  const activeSips = sips.filter((sip) => sip?.status !== "paused");
  const sipDue = activeSips
    .map((sip) => ({ sip, on: nextSipDate(sip, today) }))
    .filter((row) => daysBetween(today, row.on) <= 3)
    .sort((a, b) => (a.on < b.on ? -1 : 1))[0];
  if (sipDue) {
    insights.push({
      tone: "info",
      text: `Your ₹${toAmount(sipDue.sip.monthly_amount).toLocaleString("en-IN")} SIP for ${sipDue.sip.fund_name} goes out on ${sipDue.on}. Keep that amount free.`,
    });
  }

  const milestone = goals
    .map((goal) => ({ goal, progress: goalProgress(goal, today) }))
    .filter((row) => !row.progress.done && row.progress.pct >= 50)
    .sort((a, b) => b.progress.pct - a.progress.pct)[0];
  if (milestone) {
    insights.push({
      tone: "good",
      text: `${milestone.goal.name} is ${milestone.progress.pct}% funded. ₹${milestone.progress.remaining.toLocaleString("en-IN")} to go.`,
    });
  }

  return insights.slice(0, 4);
}

export function upcomingBills(bills = [], payments = [], today = todayKey()) {
  const paid = new Set(payments.map((payment) => payment?.bill_id));
  return bills
    .filter((bill) => bill?.active !== false && !paid.has(bill.id))
    .map((bill) => ({ ...bill, dueIn: (Number(bill.due_day) || 1) - Number(today.slice(8, 10)) }))
    .sort((a, b) => a.dueIn - b.dueIn);
}