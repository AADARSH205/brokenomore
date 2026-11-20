// Unit tests for the shared maths. Run with: node tests/money.test.mjs
import assert from "node:assert/strict";
import {
  afterSpends,
  computeDailyNumber,
  creditEstimate,
  formatINR,
  inflationAdjusted,
  sipProjection,
  spendSplit,
  toAmount,
} from "../src/lib/money.js";

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok — ${name}`);
}

test("daily number uses the hero's sample figures", () => {
  const result = computeDailyNumber({ salary: 45000, bills: 12000, savings: 6000, days: 30 });
  assert.equal(result.status, "ok");
  assert.equal(result.daily, 900);
  assert.equal(result.free, 27000);
});

test("daily number floors the result", () => {
  const result = computeDailyNumber({ salary: 10000, bills: 1000, savings: 0, days: 3 });
  assert.equal(result.daily, 3000);
  const floored = computeDailyNumber({ salary: 10001, bills: 1000, savings: 0, days: 3 });
  assert.equal(floored.daily, 3000);
});

test("bills and savings above salary never go negative", () => {
  const result = computeDailyNumber({ salary: 10000, bills: 9000, savings: 4000, days: 30 });
  assert.equal(result.status, "shortfall");
  assert.equal(result.daily, 0);
  assert.equal(result.shortfall, 3000);
});

test("exactly breaking even is a shortfall, not a number", () => {
  const result = computeDailyNumber({ salary: 10000, bills: 6000, savings: 4000, days: 30 });
  assert.equal(result.status, "shortfall");
  assert.equal(result.shortfall, 0);
});

test("zero days asks for days instead of dividing by zero", () => {
  const result = computeDailyNumber({ salary: 30000, bills: 0, savings: 0, days: 0 });
  assert.equal(result.status, "no-days");
  assert.equal(result.daily, 0);
  assert.ok(Number.isFinite(result.daily));
});

test("blank and junk input collapse to zero", () => {
  const result = computeDailyNumber({ salary: "", bills: null, savings: undefined, days: "" });
  assert.equal(result.status, "no-days");
  assert.equal(result.inHand, 0);
  assert.equal(result.daily, 0);
});

test("huge input is clamped, not shown as Infinity", () => {
  const result = computeDailyNumber({ salary: 1e15, bills: 0, savings: 0, days: 30 });
  assert.equal(result.status, "ok");
  assert.ok(Number.isFinite(result.daily));
  assert.ok(result.inHand <= 100000000);
});

test("toAmount parses pasted currency strings", () => {
  assert.equal(toAmount("₹1,50,000"), 150000);
  assert.equal(toAmount("45 000"), 45000);
  assert.equal(toAmount("abc"), 0);
  assert.equal(toAmount(-500), 0);
});

test("split bar always adds up to 100", () => {
  const split = spendSplit({ inHand: 45000, fixedBills: 12000, savingsGoal: 6000 });
  assert.equal(split.bills + split.savings + split.free, 100);
  assert.equal(split.bills, 27);
});

test("overspending shrinks tomorrow's number", () => {
  const result = afterSpends(900, 445);
  assert.equal(result.remaining, 455);
  assert.equal(result.over, false);
  const over = afterSpends(900, 1020);
  assert.equal(over.remaining, 0);
  assert.equal(over.overspend, 120);
  assert.equal(over.tomorrow, 780);
  assert.equal(over.over, true);
});

test("SIP projection without step-up", () => {
  const result = sipProjection({ monthly: 10000, years: 1, annualRate: 0, stepUpPercent: 0 });
  assert.equal(result.invested, 120000);
  assert.equal(result.value, 120000);
  assert.equal(result.gains, 0);
  assert.equal(result.series.length, 2);
});

test("SIP projection grows with a positive return", () => {
  const result = sipProjection({ monthly: 5000, years: 10, annualRate: 10, stepUpPercent: 0 });
  assert.equal(result.invested, 600000);
  assert.ok(result.value > result.invested);
  assert.equal(result.gains, result.value - result.invested);
});

test("SIP step-up invests more and ends higher", () => {
  const flat = sipProjection({ monthly: 5000, years: 10, annualRate: 10, stepUpPercent: 0 });
  const stepped = sipProjection({ monthly: 5000, years: 10, annualRate: 10, stepUpPercent: 10 });
  assert.ok(stepped.invested > flat.invested);
  assert.ok(stepped.value > flat.value);
});

test("SIP handles zero years and zero monthly", () => {
  const none = sipProjection({ monthly: 0, years: 0, annualRate: 10, stepUpPercent: 10 });
  assert.equal(none.invested, 0);
  assert.equal(none.value, 0);
});

test("inflation adjustment reduces a future value", () => {
  assert.equal(inflationAdjusted(100000, 0, 6), 100000);
  assert.ok(inflationAdjusted(100000, 10, 6) < 100000);
});

test("credit estimate returns a band, never a fake exact score", () => {
  const strong = creditEstimate({
    history: "clean",
    utilisation: "under-10",
    age: "5-plus",
    enquiries: "none",
    mix: "3-plus",
  });
  assert.equal(strong.band.label, "Excellent");
  assert.ok(strong.low >= strong.band.min && strong.high <= strong.band.max);
  assert.ok(strong.low <= strong.high);

  const weak = creditEstimate({
    history: "default",
    utilisation: "over-75",
    age: "under-1",
    enquiries: "5-plus",
    mix: "none",
  });
  assert.equal(weak.band.label, "Poor");
  assert.equal(weak.lever.key, "history");
});

test("missing answers fall back to the first option", () => {
  const result = creditEstimate({});
  assert.ok(result.band.min >= 300);
  assert.equal(result.breakdown.length, 5);
});

test("rupees format the Indian way", () => {
  assert.equal(formatINR(150000), "₹1,50,000");
  assert.equal(formatINR(0), "₹0");
});

console.log(`\n${passed} tests passed`);