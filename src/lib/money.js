// Pure maths for the daily number, the SIP projection and the credit estimate.
// No React, no browser APIs: everything here is unit-tested in tests/money.test.mjs.

export const MAX_AMOUNT = 100000000; // ₹10 crore ceiling so a stray paste cannot break the page
export const MAX_DAYS = 365;

export function clampNumber(value, min = 0, max = MAX_AMOUNT) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function toAmount(value) {
  return Math.floor(clampNumber(value, 0, MAX_AMOUNT));
}

export function formatINR(amount) {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function formatCompactINR(amount) {
  const n = Math.abs(Number.isFinite(amount) ? amount : 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 1)} cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} lakh`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
  return `₹${Math.round(n)}`;
}

/**
 * The one calculation the hero demo and the calculator both use.
 * Safe to spend today = floor((salary - bills - savings) / days)
 */
export function computeDailyNumber({ salary, bills, savings, days }) {
  const inHand = toAmount(salary);
  const fixedBills = toAmount(bills);
  const savingsGoal = toAmount(savings);
  const dayCount = Math.floor(clampNumber(days, 0, MAX_DAYS));

  const setAside = fixedBills + savingsGoal;
  const free = inHand - setAside;
  const base = { inHand, fixedBills, savingsGoal, setAside, free, days: dayCount };

  if (dayCount === 0) {
    return { ...base, status: "no-days", daily: 0, shortfall: 0 };
  }

  if (free <= 0) {
    return { ...base, status: "shortfall", daily: 0, shortfall: Math.abs(free) };
  }

  return { ...base, status: "ok", daily: Math.floor(free / dayCount), shortfall: 0 };
}

/** Percentages for the bills / savings / free split bar, always summing to 100. */
export function spendSplit({ inHand, fixedBills, savingsGoal }) {
  if (inHand <= 0) return { bills: 0, savings: 0, free: 0 };
  const bills = Math.min(100, Math.round((fixedBills / inHand) * 100));
  const savings = Math.min(100 - bills, Math.round((savingsGoal / inHand) * 100));
  return { bills, savings, free: Math.max(0, 100 - bills - savings) };
}

/** What the hero phone does when someone taps a spend. */
export function afterSpends(daily, spent) {
  const remaining = Math.max(0, daily - Math.max(0, spent));
  const overspend = Math.max(0, Math.max(0, spent) - daily);
  return {
    remaining,
    overspend,
    tomorrow: Math.max(0, daily - overspend),
    over: overspend > 0,
  };
}

/**
 * SIP projection with an optional yearly step-up.
 * Returns the year-by-year series plus totals. Illustrative only.
 */
export function sipProjection({ monthly, years, annualRate, stepUpPercent = 0 }) {
  const amount = clampNumber(monthly, 0, MAX_AMOUNT);
  const totalYears = Math.floor(clampNumber(years, 0, 50));
  const rate = clampNumber(annualRate, 0, 30) / 100;
  const stepUp = clampNumber(stepUpPercent, 0, 100) / 100;
  const monthlyRate = rate / 12;

  let balance = 0;
  let invested = 0;
  let contribution = amount;
  const series = [{ year: 0, invested: 0, value: 0 }];

  for (let year = 1; year <= totalYears; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      balance = (balance + contribution) * (1 + monthlyRate);
      invested += contribution;
    }
    series.push({
      year,
      invested: Math.round(invested),
      value: Math.round(balance),
    });
    contribution = contribution * (1 + stepUp);
  }

  return {
    series,
    invested: Math.round(invested),
    value: Math.round(balance),
    gains: Math.round(balance - invested),
  };
}

export function inflationAdjusted(value, years, inflationPercent = 6) {
  const rate = clampNumber(inflationPercent, 0, 20) / 100;
  const periods = Math.max(0, Math.floor(clampNumber(years, 0, 50)));
  return Math.round(value / Math.pow(1 + rate, periods));
}

/**
 * Reverse SIP calculator:
 * "I want ₹X in Y years, what monthly SIP?"
 * Calculates the required initial monthly investment amount.
 */
export function reverseSip({ targetWealth, years, annualRate = 12, stepUpPercent = 0 }) {
  const target = clampNumber(targetWealth, 0, MAX_AMOUNT);
  const totalYears = Math.floor(clampNumber(years, 0, 50));
  const rate = clampNumber(annualRate, 0, 30);
  const stepUp = clampNumber(stepUpPercent, 0, 100);

  if (target <= 0 || totalYears <= 0) {
    return {
      monthly: 0,
      totalInvested: 0,
      projectedWealth: 0,
      targetWealth: target,
      gains: 0,
    };
  }

  // Calculate future value for a baseline ₹1,000/month
  const baseMonthly = 1000;
  const testProjection = sipProjection({
    monthly: baseMonthly,
    years: totalYears,
    annualRate: rate,
    stepUpPercent: stepUp,
  });

  if (testProjection.value <= 0) {
    return {
      monthly: 0,
      totalInvested: 0,
      projectedWealth: 0,
      targetWealth: target,
      gains: 0,
    };
  }

  // Linear scaling
  const scaling = target / testProjection.value;
  const rawMonthly = baseMonthly * scaling;
  const monthly = Math.max(100, Math.round(rawMonthly / 50) * 50);

  const finalProjection = sipProjection({
    monthly,
    years: totalYears,
    annualRate: rate,
    stepUpPercent: stepUp,
  });

  return {
    monthly,
    totalInvested: finalProjection.invested,
    projectedWealth: finalProjection.value,
    targetWealth: target,
    gains: finalProjection.gains,
  };
}

/**
 * Emergency fund target:
 * 3 to 6 months of mandatory living expenses (rent, bills, food).
 */
export function emergencyFundEstimate(monthlyExpenses) {
  const expense = Math.max(0, Number(monthlyExpenses) || 0);
  return {
    monthlyExpenses: expense,
    threeMonths: expense * 3,
    sixMonths: expense * 6,
    recommended: expense * 6,
  };
}

export const CREDIT_BANDS = [
  { key: "poor", label: "Poor", min: 300, max: 579, note: "Lenders may say no, or say yes at a high rate." },
  { key: "fair", label: "Fair", min: 580, max: 669, note: "Some lenders will say yes, usually with conditions." },
  { key: "good", label: "Good", min: 670, max: 739, note: "Most mainstream lenders are comfortable here." },
  { key: "very-good", label: "Very good", min: 740, max: 799, note: "You will usually see better rates and offers." },
  { key: "excellent", label: "Excellent", min: 800, max: 900, note: "The best pricing lenders offer." },
];

export function bandFor(score) {
  const clamped = Math.min(900, Math.max(300, score));
  return CREDIT_BANDS.find((band) => clamped >= band.min && clamped <= band.max) ?? CREDIT_BANDS[0];
}

const CREDIT_FACTORS = [
  {
    key: "history",
    label: "Payment history",
    weight: 0.35,
    options: [
      { value: "clean", label: "Everything paid on time", score: 1 },
      { value: "one-late", label: "One payment missed in the last year", score: 0.7 },
      { value: "few-late", label: "A few payments missed", score: 0.45 },
      { value: "default", label: "A default or settlement on record", score: 0.2 },
    ],
    fix: "Set auto-pay for the full amount on every card and loan EMI. One clean year does more than anything else on this list.",
  },
  {
    key: "utilisation",
    label: "Credit utilisation",
    weight: 0.3,
    options: [
      { value: "under-10", label: "Under 10% of my limit", score: 1 },
      { value: "10-30", label: "10% to 30%", score: 0.9 },
      { value: "30-50", label: "30% to 50%", score: 0.7 },
      { value: "50-75", label: "50% to 75%", score: 0.45 },
      { value: "over-75", label: "Over 75%", score: 0.2 },
    ],
    fix: "Pay a card down before the statement date, not just before the due date, so the reported balance stays low.",
  },
  {
    key: "age",
    label: "Age of your credit",
    weight: 0.15,
    options: [
      { value: "5-plus", label: "More than 5 years", score: 1 },
      { value: "3-5", label: "3 to 5 years", score: 0.85 },
      { value: "1-3", label: "1 to 3 years", score: 0.65 },
      { value: "under-1", label: "Less than a year", score: 0.4 },
    ],
    fix: "Keep your oldest card open and use it for one small recurring bill. Age is the slowest factor and the easiest to protect.",
  },
  {
    key: "enquiries",
    label: "New credit enquiries",
    weight: 0.1,
    options: [
      { value: "none", label: "None in the last 6 months", score: 1 },
      { value: "1-2", label: "1 or 2", score: 0.85 },
      { value: "3-4", label: "3 or 4", score: 0.6 },
      { value: "5-plus", label: "5 or more", score: 0.35 },
    ],
    fix: "Space out applications. Every hard enquiry shows on your report even when you are approved.",
  },
  {
    key: "mix",
    label: "Credit mix",
    weight: 0.1,
    options: [
      { value: "3-plus", label: "Three or more types", score: 1 },
      { value: "2", label: "Two types", score: 0.85 },
      { value: "1", label: "One type", score: 0.6 },
      { value: "none", label: "None yet", score: 0.4 },
    ],
    fix: "A mix helps a little, but never take on debt you do not need just to improve it.",
  },
];

export { CREDIT_FACTORS };

/**
 * Weighted estimate that returns a band, never a precise score.
 */
export function creditEstimate(answers) {
  let points = 0;
  let biggestGap = -1;
  let lever = null;

  const breakdown = CREDIT_FACTORS.map((factor) => {
    const chosen =
      factor.options.find((option) => option.value === answers?.[factor.key]) ?? factor.options[0];
    const weighted = chosen.score * factor.weight;
    points += weighted;
    const gap = (1 - chosen.score) * factor.weight;
    if (gap > biggestGap) {
      biggestGap = gap;
      lever = factor;
    }
    return {
      key: factor.key,
      label: factor.label,
      weight: factor.weight,
      score: chosen.score,
      chosenLabel: chosen.label,
    };
  });

  const raw = Math.round(300 + points * 600);
  const band = bandFor(raw);
  const low = Math.max(band.min, Math.min(band.max, raw - 15));
  const high = Math.max(band.min, Math.min(band.max, raw + 15));

  return {
    band,
    low,
    high,
    raw,
    breakdown,
    lever: lever
      ? { key: lever.key, label: lever.label, fix: lever.fix }
      : { key: null, label: "Nothing urgent", fix: "Your answers already point to the strong end of every factor." },
  };
}