const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useCallback, useEffect, useState } from "react";

import { addMonths, monthKeyOf } from "@/lib/finance";

const page = (result) => (Array.isArray(result) ? result : result?.items ?? []);

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
 * `scope` limits the read to the entities a screen actually uses, so opening a
 * page costs one or two queries instead of eight.
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
      const [profile, expenses, budgets, bills, payments, goals, sips, taxProfiles] = await Promise.all([
        wants("profile") ? db.entities.FinanceProfile.list("-created_date", 1) : null,
        wants("expenses")
          ? db.entities.Expense.filter(
              { date: { $gte: `${addMonths(month, -5)}-01`, $lte: `${month}-31` } },
              { sort: "-date", limit: 500 },
            )
          : null,
        wants("budgets") ? db.entities.Budget.filter({ month }, { limit: 50 }) : null,
        wants("bills") ? db.entities.RecurringBill.filter({ active: true }, { limit: 50 }) : null,
        wants("payments")
          ? db.entities.BillPayment.filter({ month: { $in: [month, prevMonth] } }, { limit: 100 })
          : null,
        wants("goals") ? db.entities.SavingsGoal.list("-created_date", 50) : null,
        wants("sips") ? db.entities.SipPlan.list("-created_date", 50) : null,
        wants("taxProfile") ? db.entities.TaxProfile.list("-created_date", 1) : null,
      ]);

      setState({
        profile: page(profile)[0] ?? null,
        expenses: page(expenses),
        budgets: page(budgets),
        bills: page(bills),
        payments: page(payments),
        goals: page(goals),
        sips: page(sips),
        taxProfile: page(taxProfiles)[0] ?? null,
        loading: false,
        error: null,
        month,
        prevMonth,
      });
    } catch (error) {
      setState({ ...EMPTY, loading: false, error, month, prevMonth });
    }
  }, [month, scopeKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}