// Unit tests for the dashboard and tax maths. Run with: node tests/finance.test.mjs
import assert from "node:assert/strict";
import {
  budgetStatus,
  buildInsights,
  goalProgress,
  safeToSpend,
  salaryCycle,
  sipTotals,
  sipInvested,
  totalsByCategory,
} from "../src/lib/finance.js";
import { compareRegimes, computeRegime, hraExemption, slabTax } from "../src/lib/tax.js";

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok — ${name}`);
}

test("the brief's sample figures give ₹900 a day", () => {
  const result = safeToSpend({
    income: 45000,
    savingsTarget: 6000,
    unpaidBills: 12000,
    spent: 0,
    daysLeft: 30,
  });
  assert.equal(result.status, "ok");
  assert.equal(result.pool, 27000);
  assert.equal(result.perDay, 900);
});

test("recorded expenses shrink today's number", () => {
  const before = safeToSpend({ income: 45000, savingsTarget: 6000, unpaidBills: 12000, spent: 0, daysLeft: 30 });
  const after = safeToSpend({ income: 45000, savingsTarget: 6000, unpaidBills: 12000, spent: 6000, daysLeft: 20 });
  assert.equal(before.perDay, 900);
  assert.equal(after.pool, 21000);
  assert.equal(after.perDay, 1050);
});

test("a paid bill is not subtracted twice", () => {
  // Paying rent turns the unpaid bill into a recorded expense: bills go to zero.
  const unpaid = safeToSpend({ income: 45000, unpaidBills: 12000, spent: 0, daysLeft: 30 });
  const paid = safeToSpend({ income: 45000, unpaidBills: 0, spent: 12000, daysLeft: 30 });
  assert.equal(unpaid.perDay, paid.perDay);
});

test("an overspent month reports a shortfall, never a negative number", () => {
  const result = safeToSpend({ income: 30000, savingsTarget: 5000, unpaidBills: 10000, spent: 20000, daysLeft: 12 });
  assert.equal(result.status, "shortfall");
  assert.equal(result.perDay, 0);
  assert.equal(result.shortfall, 5000);
});

test("zero days and missing values never divide by zero", () => {
  const result = safeToSpend({ income: 30000, spent: 0, daysLeft: 0 });
  assert.equal(result.days, 1);
  assert.ok(Number.isFinite(result.perDay));
  const empty = safeToSpend({});
  assert.equal(empty.status, "shortfall");
});

test("salary cycle starts on payday and counts today", () => {
  const onPayday = salaryCycle(new Date(2026, 10, 1), 1);
  assert.equal(onPayday.startKey, "2026-11-01");
  assert.equal(onPayday.endKey, "2026-12-01");
  assert.equal(onPayday.daysLeft, 30);

  const midMonth = salaryCycle(new Date(2026, 10, 20), 1);
  assert.equal(midMonth.startKey, "2026-11-01");
  assert.equal(midMonth.daysLeft, 11);

  const lateMonth = salaryCycle(new Date(2026, 10, 20), 25);
  assert.equal(lateMonth.startKey, "2026-10-25");
  assert.equal(lateMonth.endKey, "2026-11-25");
  assert.equal(lateMonth.daysLeft, 5);
});

test("a salary day past the end of a short month clamps safely", () => {
  const cycle = salaryCycle(new Date(2026, 1, 15), 31);
  assert.equal(cycle.startKey, "2026-01-31");
  assert.equal(cycle.endKey, "2026-02-28");
});

test("budget status flags the 80% and over-budget lines", () => {
  assert.equal(budgetStatus(10000, 5000).state, "ok");
  assert.equal(budgetStatus(10000, 8000).state, "watch");
  assert.equal(budgetStatus(10000, 8000).pct, 80);
  assert.equal(budgetStatus(10000, 12000).state, "over");
  assert.equal(budgetStatus(10000, 12000).remaining, -2000);
  assert.equal(budgetStatus(0, 500).state, "none");
});

test("goal progress suggests a monthly amount", () => {
  const goal = { name: "Emergency fund", target_amount: 90000, saved_amount: 30000, target_date: "2027-11-20" };
  const progress = goalProgress(goal, "2026-11-20");
  assert.equal(progress.pct, 33);
  assert.equal(progress.remaining, 60000);
  assert.equal(progress.monthsLeft, 12);
  assert.equal(progress.suggestedMonthly, 5000);

  const done = goalProgress({ target_amount: 1000, saved_amount: 5000 }, "2026-11-20");
  assert.equal(done.done, true);
  assert.equal(done.saved, 1000);
});

test("category totals and SIP totals add up", () => {
  const totals = totalsByCategory([
    { category: "food", amount: 500 },
    { category: "food", amount: 250 },
    { category: "rent", amount: 12000 },
  ]);
  assert.equal(totals.food, 750);
  assert.equal(totals.rent, 12000);

  const sips = sipTotals([
    { monthly_amount: 5000, status: "active" },
    { monthly_amount: 2000, status: "active" },
    { monthly_amount: 1000, status: "paused" },
  ]);
  assert.equal(sips.monthly, 7000);
  assert.equal(sips.activeCount, 2);
});

test("SIP instalments count from the start date", () => {
  const sip = { monthly_amount: 5000, start_date: "2026-01-10", sip_day: 10 };
  assert.equal(sipInvested(sip, "2026-11-20"), 55000);
  assert.equal(sipInvested({ ...sip, start_date: "2027-01-10" }, "2026-11-20"), 0);
});

test("insights speak in real numbers", () => {
  const cycle = salaryCycle(new Date(2026, 10, 20), 1);
  const insights = buildInsights({
    profile: { monthly_income: 45000, monthly_savings_target: 6000 },
    cycle,
    expenses: [
      { amount: 8000, category: "food", date: "2026-11-05" },
      { amount: 4000, category: "food", date: "2026-11-15" },
    ],
    prevExpenses: [{ amount: 5000, category: "food", date: "2026-10-05" }],
    budgets: [],
    bills: [],
    payments: [],
    goals: [],
    sips: [],
    today: "2026-11-20",
  });
  assert.ok(insights.length > 0);
  assert.ok(insights.some((item) => item.text.includes("food")));
});

test("slab tax adds each slice once", () => {
  const slabs = [
    { upTo: 250000, rate: 0 },
    { upTo: 500000, rate: 0.05 },
    { upTo: 1000000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ];
  assert.equal(slabTax(250000, slabs), 0);
  assert.equal(slabTax(500000, slabs), 12500);
  assert.equal(slabTax(1000000, slabs), 112500);
});

test("₹12.75 lakh gross salary is tax free in the new regime", () => {
  const result = computeRegime({ gross_salary: 1275000 }, "new");
  assert.equal(result.taxable, 1200000);
  assert.equal(result.total, 0);
});

test("new regime at ₹15 lakh gross is about ₹97,500 with cess", () => {
  const result = computeRegime({ gross_salary: 1500000 }, "new");
  assert.equal(result.taxable, 1425000);
  assert.equal(result.baseTax, 93750);
  assert.equal(result.total, 97500);
  assert.equal(result.monthly, 8125);
});

test("new regime gives marginal relief just above ₹12 lakh", () => {
  const result = computeRegime({ gross_salary: 1285000 }, "new");
  assert.equal(result.taxable, 1210000);
  assert.ok(result.marginalRelief > 0);
  assert.ok(result.total < 60000);
});

test("old regime deductions reduce taxable income", () => {
  const result = computeRegime(
    {
      gross_salary: 1500000,
      basic_salary: 600000,
      hra_received: 240000,
      rent_paid: 240000,
      metro: true,
      employee_pf: 72000,
      other_80c: 50000,
      employee_nps: 50000,
      health_insurance: 25000,
      home_loan_interest: 0,
    },
    "old",
  );
  assert.ok(result.deductions > 400000);
  assert.ok(result.taxable < 1100000);
  assert.ok(result.total > 0);
});

test("HRA exemption takes the least of the three tests", () => {
  const caps = { hraMetro: 0.5, hraNonMetro: 0.4, hraBasicShare: 0.1 };
  assert.equal(hraExemption({ hraReceived: 240000, rentPaid: 240000, basic: 600000, metro: true, caps }), 180000);
  assert.equal(hraExemption({ hraReceived: 240000, rentPaid: 0, basic: 600000, metro: true, caps }), 0);
});

test("regime comparison names the cheaper one", () => {
  const comparison = compareRegimes({
    gross_salary: 900000,
    basic_salary: 360000,
    employee_pf: 43200,
    health_insurance: 20000,
  });
  assert.ok(["old", "new", "equal"].includes(comparison.better));
  assert.ok(comparison.saving >= 0);
  assert.equal(comparison.new.total, 0); // ₹9 lakh is below the rebate ceiling
});

test("zero salary is handled without NaN", () => {
  const result = computeRegime({}, "new");
  assert.equal(result.total, 0);
  assert.equal(result.monthly, 0);
  assert.ok(Number.isFinite(result.effectiveRate));
});

console.log(`\n${passed} tests passed`);