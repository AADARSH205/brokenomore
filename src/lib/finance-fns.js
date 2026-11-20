// Server functions for every financial write. Each one requires a signed-in caller,
// validates the numbers with zod, and only ever touches the caller's own records:
// the entity rules on the server client do the ownership check, and each handler
// confirms the record belongs to the caller before changing it.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { CATEGORY_VALUES } from "@/lib/categories";

const category = z.enum(CATEGORY_VALUES);
const amount = z.number().min(0).max(100000000);
const positive = z.number().positive().max(100000000);
const dayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-20");
const monthKey = z.string().regex(/^\d{4}-\d{2}$/, "Use a month like 2026-11");
const id = z.string().min(1);

const ENTITIES = [
  "FinanceProfile",
  "Expense",
  "Budget",
  "RecurringBill",
  "BillPayment",
  "SavingsGoal",
  "SipPlan",
  "TaxProfile",
];

async function own(context, entity, recordId) {
  const record = await context
    .getBase44()
    .entities[entity].get(recordId)
    .catch(() => null);
  if (!record) {
    throw Object.assign(new Error("That record was not found, or it is not yours."), { status: 404 });
  }
  return record;
}

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z
      .object({
        id: id.optional(),
        display_name: z.string().trim().max(60).optional().default(""),
        monthly_income: amount.default(0),
        extra_income: amount.default(0),
        salary_day: z.number().int().min(1).max(31).default(1),
        monthly_savings_target: amount.default(0),
        safety_buffer: amount.default(0),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const payload = { ...data, onboarded: true };
    delete payload.id;
    if (data.id) {
      await own(context, "FinanceProfile", data.id);
      return db.entities.FinanceProfile.update(data.id, payload);
    }
    const existing = await db.entities.FinanceProfile.list("-created_date", 1);
    const current = (Array.isArray(existing) ? existing : existing?.items ?? [])[0];
    if (current) return db.entities.FinanceProfile.update(current.id, payload);
    return db.entities.FinanceProfile.create(payload);
  });

export const saveExpense = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z
      .object({
        id: id.optional(),
        amount: positive,
        category,
        date: dayKey,
        description: z.string().trim().max(120).optional().default(""),
        payment_method: z.enum(["upi", "card", "cash", "netbanking", "autopay", "other"]).default("upi"),
        is_recurring: z.boolean().default(false),
        is_planned: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id: recordId, ...payload } = data;
    if (recordId) {
      await own(context, "Expense", recordId);
      return db.entities.Expense.update(recordId, payload);
    }
    return db.entities.Expense.create(payload);
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ id }).parse(data))
  .handler(async ({ data, context }) => {
    await own(context, "Expense", data.id);
    await context.getBase44().entities.Expense.delete(data.id);
    return { ok: true };
  });

export const saveBudget = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ month: monthKey, category, limit_amount: amount }).parse(data))
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const page = await db.entities.Budget.filter({ month: data.month, category: data.category }, { limit: 5 });
    const existing = (Array.isArray(page) ? page : page?.items ?? [])[0];
    if (existing) {
      if (data.limit_amount === 0) {
        await db.entities.Budget.delete(existing.id);
        return { ok: true, removed: true };
      }
      return db.entities.Budget.update(existing.id, { limit_amount: data.limit_amount });
    }
    if (data.limit_amount === 0) return { ok: true, removed: true };
    return db.entities.Budget.create(data);
  });

export const saveBill = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z
      .object({
        id: id.optional(),
        name: z.string().trim().min(2).max(60),
        amount: positive,
        category,
        due_day: z.number().int().min(1).max(31),
        is_essential: z.boolean().default(true),
        active: z.boolean().default(true),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id: recordId, ...payload } = data;
    if (recordId) {
      await own(context, "RecurringBill", recordId);
      return db.entities.RecurringBill.update(recordId, payload);
    }
    return db.entities.RecurringBill.create(payload);
  });

export const deleteBill = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ id }).parse(data))
  .handler(async ({ data, context }) => {
    await own(context, "RecurringBill", data.id);
    await context.getBase44().entities.RecurringBill.delete(data.id);
    return { ok: true };
  });

/**
 * Marking a bill paid records the spend once and links the two, so the amount is
 * never counted twice: an unpaid bill is held back from the daily number, a paid
 * one is an expense. Unmarking reverses both.
 */
export const setBillPaid = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z.object({ bill_id: id, month: monthKey, paid: z.boolean(), paid_on: dayKey.optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const bill = await own(context, "RecurringBill", data.bill_id);

    const page = await db.entities.BillPayment.filter({ bill_id: bill.id, month: data.month }, { limit: 5 });
    const existing = (Array.isArray(page) ? page : page?.items ?? [])[0];

    if (!data.paid) {
      if (!existing) return { ok: true };
      if (existing.expense_id) {
        await db.entities.Expense.delete(existing.expense_id).catch(() => null);
      }
      await db.entities.BillPayment.delete(existing.id);
      return { ok: true };
    }

    if (existing) return { ok: true, already: true };

    const paidOn = data.paid_on ?? new Date().toISOString().slice(0, 10);
    const expense = await db.entities.Expense.create({
      amount: bill.amount,
      category: bill.category || "bills",
      date: paidOn,
      description: `${bill.name} (bill)`,
      payment_method: "autopay",
      is_recurring: true,
      is_planned: false,
    });
    await db.entities.BillPayment.create({
      bill_id: bill.id,
      month: data.month,
      paid_on: paidOn,
      amount: bill.amount,
      expense_id: expense.id,
    });
    return { ok: true, expense_id: expense.id };
  });

export const saveGoal = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z
      .object({
        id: id.optional(),
        name: z.string().trim().min(2).max(60),
        kind: z.enum(["emergency", "laptop", "vehicle", "vacation", "education", "house", "other"]).default("other"),
        target_amount: positive,
        saved_amount: amount.default(0),
        target_date: dayKey.optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id: recordId, ...payload } = data;
    const clean = { ...payload, target_date: payload.target_date || undefined };
    if (recordId) {
      await own(context, "SavingsGoal", recordId);
      return db.entities.SavingsGoal.update(recordId, clean);
    }
    return db.entities.SavingsGoal.create(clean);
  });

export const addToGoal = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ id, amount: positive }).parse(data))
  .handler(async ({ data, context }) => {
    const goal = await own(context, "SavingsGoal", data.id);
    const next = Math.min(Number(goal.target_amount) || 0, (Number(goal.saved_amount) || 0) + data.amount);
    return context.getBase44().entities.SavingsGoal.update(goal.id, { saved_amount: next });
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ id }).parse(data))
  .handler(async ({ data, context }) => {
    await own(context, "SavingsGoal", data.id);
    await context.getBase44().entities.SavingsGoal.delete(data.id);
    return { ok: true };
  });

export const saveSip = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z
      .object({
        id: id.optional(),
        fund_name: z.string().trim().min(2).max(80),
        monthly_amount: positive,
        start_date: dayKey,
        sip_day: z.number().int().min(1).max(31).default(5),
        goal: z.string().trim().max(80).optional().default(""),
        duration_years: z.number().min(1).max(50).default(10),
        status: z.enum(["active", "paused"]).default("active"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id: recordId, ...payload } = data;
    if (recordId) {
      await own(context, "SipPlan", recordId);
      return db.entities.SipPlan.update(recordId, payload);
    }
    return db.entities.SipPlan.create(payload);
  });

export const deleteSip = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ id }).parse(data))
  .handler(async ({ data, context }) => {
    await own(context, "SipPlan", data.id);
    await context.getBase44().entities.SipPlan.delete(data.id);
    return { ok: true };
  });

export const saveTaxProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) =>
    z
      .object({
        id: id.optional(),
        financial_year: z.string().regex(/^\d{4}-\d{2}$/),
        gross_salary: amount,
        bonus: amount.default(0),
        other_income: amount.default(0),
        checklist: z.array(z.string().max(40)).max(20).default([]),
        basic_salary: amount.default(0),
        hra_received: amount.default(0),
        rent_paid: amount.default(0),
        metro: z.boolean().default(false),
        employee_pf: amount.default(0),
        other_80c: amount.default(0),
        employee_nps: amount.default(0),
        employer_nps: amount.default(0),
        health_insurance: amount.default(0),
        home_loan_interest: amount.default(0),
        other_deductions: amount.default(0),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = context.getBase44();
    const { id: recordId, ...payload } = data;
    if (recordId) {
      await own(context, "TaxProfile", recordId);
      return db.entities.TaxProfile.update(recordId, payload);
    }
    const page = await db.entities.TaxProfile.filter({ financial_year: data.financial_year }, { limit: 1 });
    const existing = (Array.isArray(page) ? page : page?.items ?? [])[0];
    if (existing) return db.entities.TaxProfile.update(existing.id, payload);
    return db.entities.TaxProfile.create(payload);
  });

export const exportMyData = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const db = context.getBase44();
    const entries = await Promise.all(
      ENTITIES.map(async (entity) => {
        const result = await db.entities[entity].list("-created_date", 500);
        return [entity, Array.isArray(result) ? result : result?.items ?? []];
      }),
    );
    return { exported_at: new Date().toISOString(), data: Object.fromEntries(entries) };
  });

export const clearMyData = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator((data) => z.object({ confirm: z.literal("DELETE") }).parse(data))
  .handler(async ({ context }) => {
    const db = context.getBase44();
    await Promise.all(ENTITIES.map((entity) => db.entities[entity].deleteMany({ created_by_id: context.user.id })));
    return { ok: true };
  });