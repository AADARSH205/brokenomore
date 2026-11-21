// The tax engine. Every number comes from src/data/tax-rules.js so a Budget change
// is a data edit, never a code change. Pure functions: no React, no browser APIs.
import { rulesFor, CURRENT_FY } from "../data/tax-rules.js";

export { rulesFor };

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const round = (value) => Math.round(value);

export function slabTax(taxable, slabs) {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxable <= lower) break;
    const slice = Math.min(taxable, slab.upTo) - lower;
    tax += slice * slab.rate;
    lower = slab.upTo;
  }
  return tax;
}

export function surchargeRate(taxable, bands = []) {
  return bands.find((band) => taxable > band.above)?.rate ?? 0;
}

/** HRA exemption: the least of the three tests in section 10(13A). */
export function hraExemption({
  hraReceived,
  rentPaid,
  basic,
  metro,
  caps = { hraMetro: 0.5, hraNonMetro: 0.4, hraBasicShare: 0.1 },
}) {
  const received = num(hraReceived);
  const rent = num(rentPaid);
  const base = num(basic);
  if (received === 0 || rent === 0) return 0;
  const metroShare = caps?.hraMetro ?? 0.5;
  const nonMetroShare = caps?.hraNonMetro ?? 0.4;
  const basicShare = caps?.hraBasicShare ?? 0.1;
  const share = metro ? metroShare : nonMetroShare;
  return round(Math.max(0, Math.min(received, rent - base * basicShare, base * share)));
}

/**
 * One regime, start to finish. Returns the working, not just a number, so the
 * page can show every step and explain zero tax in plain words.
 */
export function computeRegime(input = {}, regime = "new", financialYear = CURRENT_FY) {
  const rules = rulesFor(financialYear);
  const spec = rules[regime] ?? rules.new;
  const caps = rules.caps;

  // Bonus is taxed as salary, so it joins gross. Other income is added to the
  // taxable total after deductions, because no salary deduction applies to it.
  const gross = num(input.gross_salary || input.ctc || input.annual_ctc) + num(input.bonus);
  const otherIncome = num(input.other_income);
  const basic = num(input.basic_salary) || (gross > 0 ? round(gross * 0.45) : 0);
  const lines = [];
  let deductions = 0;

  const addLine = (label, amount, note, section = "") => {
    const value = Math.max(0, round(amount));
    if (value <= 0) return;
    lines.push({ label, amount: value, note, section });
    deductions += value;
  };

  addLine(
    "Standard deduction",
    Math.min(spec.standardDeduction, gross),
    `Flat deduction for salaried employees (₹${spec.standardDeduction.toLocaleString("en-IN")})`,
    "Sec 16(ia)",
  );

  const employerNps = Math.min(num(input.employer_nps), basic * caps.employerNpsRate);
  addLine(
    "Employer NPS",
    employerNps,
    `Capped at ${Math.round(caps.employerNpsRate * 100)}% of basic (Section 80CCD(2))`,
    "Sec 80CCD(2)",
  );

  if (regime === "old") {
    const calculatedHra = hraExemption({
      hraReceived: input.hra_received,
      rentPaid: input.rent_paid,
      basic,
      metro: Boolean(input.metro),
      caps,
    });
    addLine(
      "HRA exemption",
      calculatedHra,
      "Least of HRA received, rent minus 10% of basic, and 50%/40% of basic",
      "Sec 10(13A)",
    );

    const claimed80c = num(input.section_80c || (num(input.employee_pf) + num(input.other_80c)));
    addLine(
      "Section 80C",
      Math.min(claimed80c, caps.section80c),
      "EPF, PPF, ELSS mutual funds, life insurance, tuition fees",
      "Sec 80C",
    );

    // Employee's own voluntary NPS under Section 124(3) / 80CCD(1B)
    const claimedNps124 = num(input.employee_nps || input.nps_124);
    addLine(
      "Employee NPS (Section 124(3))",
      Math.min(claimedNps124, caps.nps1b),
      "Additional voluntary NPS deduction up to ₹50,000 (Section 124(3) / 80CCD(1B))",
      "Sec 124(3)",
    );

    const claimedHealth = num(input.section_80d || input.health_insurance);
    addLine(
      "Health insurance (Section 80D)",
      Math.min(claimedHealth, caps.health),
      "Health insurance premium for self, spouse, children & parents",
      "Sec 80D",
    );

    const claimedHomeInterest = num(input.home_loan_interest);
    addLine(
      "Home loan interest (Section 24(b))",
      Math.min(claimedHomeInterest, caps.homeLoanInterest),
      "Self-occupied property interest deduction",
      "Sec 24(b)",
    );

    addLine("Other deductions", num(input.other_deductions), "80TTA, 80E education loan interest and similar", "Others");
  }

  const taxable = Math.max(0, gross - deductions) + otherIncome;
  const baseTax = slabTax(taxable, spec.slabs);
  const rebate = taxable <= spec.rebate.taxableLimit ? Math.min(baseTax, spec.rebate.maxRebate) : 0;
  let tax = Math.max(0, baseTax - rebate);

  let marginalRelief = 0;
  if (spec.rebate.marginalRelief && taxable > spec.rebate.taxableLimit) {
    const excessIncome = taxable - spec.rebate.taxableLimit;
    if (baseTax > excessIncome) {
      marginalRelief = baseTax - excessIncome;
      tax = excessIncome;
    }
  }

  const surcharge = tax * surchargeRate(taxable, spec.surcharge);
  const cess = (tax + surcharge) * rules.cess;
  const total = tax + surcharge + cess;

  // Plain words zero-tax reason
  let zeroTaxExplanation = null;
  if (round(total) === 0) {
    if (gross === 0) {
      zeroTaxExplanation = "Enter your salary to calculate your tax.";
    } else if (taxable === 0) {
      zeroTaxExplanation = "Your income is fully offset by standard deduction and deductions, leaving ₹0 taxable income.";
    } else if (regime === "new") {
      zeroTaxExplanation = `You owe ₹0 tax! Your standard deduction of ₹${spec.standardDeduction.toLocaleString(
        "en-IN",
      )} brings taxable income to ₹${taxable.toLocaleString(
        "en-IN",
      )} (at or below ₹12 Lakh). The Section 87A rebate covers 100% of the ₹${round(baseTax).toLocaleString(
        "en-IN",
      )} slab tax.`;
    } else {
      zeroTaxExplanation = `You owe ₹0 tax! Deductions reduce your taxable income to ₹${taxable.toLocaleString(
        "en-IN",
      )} (at or below ₹5 Lakh), fully rebated under Section 87A.`;
    }
  }

  return {
    regime,
    label: spec.name,
    financialYear,
    rulesLabel: rules.label,
    gross,
    basic,
    otherIncome,
    deductions,
    taxable,
    baseTax: round(baseTax),
    rebate: round(rebate),
    marginalRelief: round(marginalRelief),
    surcharge: round(surcharge),
    cess: round(cess),
    total: round(total),
    monthly: round(total / 12),
    effectiveRate: gross + otherIncome > 0 ? Math.round((total / (gross + otherIncome)) * 1000) / 10 : 0,
    lines,
    isZeroTax: round(total) === 0,
    zeroTaxExplanation,
  };
}

export function compareRegimes(input = {}, financialYear = CURRENT_FY) {
  const oldRegime = computeRegime(input, "old", financialYear);
  const newRegime = computeRegime(input, "new", financialYear);
  const difference = oldRegime.total - newRegime.total;
  const saving = Math.abs(difference);

  let better = "equal";
  if (difference > 0) better = "new";
  else if (difference < 0) better = "old";

  // Build the exact required headline: "Your tax: ₹X under New, ₹Y under Old. Better for you: <regime>, saves ₹Z."
  let headline = "";
  if (oldRegime.total === 0 && newRegime.total === 0) {
    headline = "Your tax: ₹0 under New, ₹0 under Old. Better for you: either regime (zero tax).";
  } else if (better === "new") {
    headline = `Your tax: ₹${newRegime.total.toLocaleString("en-IN")} under New, ₹${oldRegime.total.toLocaleString(
      "en-IN",
    )} under Old. Better for you: New regime, saves ₹${saving.toLocaleString("en-IN")}.`;
  } else if (better === "old") {
    headline = `Your tax: ₹${newRegime.total.toLocaleString("en-IN")} under New, ₹${oldRegime.total.toLocaleString(
      "en-IN",
    )} under Old. Better for you: Old regime, saves ₹${saving.toLocaleString("en-IN")}.`;
  } else {
    headline = `Your tax: ₹${newRegime.total.toLocaleString("en-IN")} under New, ₹${oldRegime.total.toLocaleString(
      "en-IN",
    )} under Old. Both regimes work out exactly equal.`;
  }

  return {
    old: oldRegime,
    new: newRegime,
    better,
    saving,
    headline,
    isZeroTaxBoth: oldRegime.total === 0 && newRegime.total === 0,
  };
}

/**
 * "Where each rupee of deductions helps" explainer.
 * Only lists deductions as relevant when the old regime actually wins for that user.
 */
export function deductionValueBreakdown(input = {}, financialYear = CURRENT_FY) {
  const comparison = compareRegimes(input, financialYear);
  const oldRegime = comparison.old;
  const oldWins = comparison.better === "old";

  if (!oldWins) {
    return {
      oldWins: false,
      message:
        "Under your current figures, the New Tax Regime is more beneficial. The higher ₹75,000 standard deduction, ₹12 Lakh zero-tax rebate limit, and lower slab rates save you more money than claiming deductions under the Old Regime without locking funds in tax-saving instruments.",
      items: [],
      totalDeductions: 0,
      totalSaved: 0,
    };
  }

  // Calculate marginal tax rate under Old Regime to show how much each deduction saves
  const taxable = oldRegime.taxable;
  let marginalRate = 0.05;
  if (taxable > 1000000) marginalRate = 0.3;
  else if (taxable > 500000) marginalRate = 0.2;

  const rateWithCess = marginalRate * 1.04;

  const items = oldRegime.lines.map((line) => {
    const taxSaved = round(line.amount * rateWithCess);
    return {
      label: line.label,
      section: line.section,
      claimed: line.amount,
      note: line.note,
      taxSaved,
      marginalPercent: Math.round(rateWithCess * 100),
    };
  });

  const totalDeductions = oldRegime.deductions;
  const totalSaved = items.reduce((sum, item) => sum + item.taxSaved, 0);

  return {
    oldWins: true,
    message: `Your deductions of ₹${totalDeductions.toLocaleString(
      "en-IN",
    )} successfully push the Old Regime ahead, saving you ₹${comparison.saving.toLocaleString(
      "en-IN",
    )} compared to the New Regime.`,
    items,
    totalDeductions,
    totalSaved,
  };
}

/**
 * In-hand salary estimator: Converts annual CTC / Gross to monthly take-home.
 */
export function estimateInHandSalary(input = {}, financialYear = CURRENT_FY) {
  const gross = num(input.gross_salary || input.ctc || input.annual_ctc);
  const basic = num(input.basic_salary) || (gross > 0 ? round(gross * 0.45) : 0);
  const monthlyGross = round(gross / 12);
  const monthlyBasic = round(basic / 12);

  // Employee Provident Fund (PF): 12% of basic
  // Can be capped at statutory ceiling of ₹1,800/mo (12% of ₹15,000) or actual 12% of basic
  const pfMonthly = input.pf_statutory_cap
    ? Math.min(round(monthlyBasic * 0.12), 1800)
    : round(monthlyBasic * 0.12);

  // Professional Tax: standard ~₹200/month (₹2,400/yr)
  const profTaxMonthly = gross > 150000 ? 200 : 0;

  // Income Tax TDS under the best regime
  const comparison = compareRegimes({ ...input, gross_salary: gross, basic_salary: basic }, financialYear);
  const bestRegime = comparison.better === "old" ? comparison.old : comparison.new;
  const annualTds = bestRegime.total;
  const monthlyTds = bestRegime.monthly;

  // Monthly In-Hand Take-Home
  const monthlyInHand = Math.max(0, monthlyGross - pfMonthly - profTaxMonthly - monthlyTds);
  const annualInHand = monthlyInHand * 12;

  return {
    grossAnnual: gross,
    monthlyGross,
    monthlyBasic,
    pfMonthly,
    profTaxMonthly,
    monthlyTds,
    annualTds,
    winningRegime: bestRegime.label,
    monthlyInHand,
    annualInHand,
    // Deep link or search param to pre-fill the safe-to-spend calculator
    safeToSpendSalaryParam: String(monthlyInHand),
  };
}

/** Unused headroom under the common old-regime sections, for the suggestions list. */
export function savingOpportunities(input = {}, financialYear = CURRENT_FY) {
  const caps = rulesFor(financialYear).caps;
  const used80c = num(input.section_80c || (num(input.employee_pf) + num(input.other_80c)));
  const claimedNps = num(input.employee_nps || input.nps_124);
  const claimedHealth = num(input.section_80d || input.health_insurance);
  const claimedHome = num(input.home_loan_interest);

  const opportunities = [
    {
      label: "Section 80C investments",
      remaining: Math.max(0, caps.section80c - used80c),
      note: "ELSS, PPF, EPF top-up or a term insurance plan count here.",
    },
    {
      label: "NPS under Section 124(3) / 80CCD(1B)",
      remaining: Math.max(0, caps.nps1b - claimedNps),
      note: "An extra ₹50,000 voluntary deduction exclusively for Tier-1 NPS.",
    },
    {
      label: "Health insurance under Section 80D",
      remaining: Math.max(0, caps.health - claimedHealth),
      note: "Covers you, spouse, children and senior citizen parents.",
    },
    {
      label: "Home loan interest under Section 24(b)",
      remaining: Math.max(0, caps.homeLoanInterest - claimedHome),
      note: "Available on interest paid for a self-occupied home loan up to ₹2 Lakh.",
    },
  ];
  return opportunities.filter((item) => item.remaining > 0);
}

export function formatPercent(value) {
  return `${Number.isFinite(value) ? value : 0}%`;
}
