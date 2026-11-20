// The tax engine. Every number comes from src/data/tax-rules.js so a Budget change
// is a data edit, never a code change. Pure functions: no React, no browser APIs.
import { rulesFor } from "../data/tax-rules.js";

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
export function hraExemption({ hraReceived, rentPaid, basic, metro, caps }) {
  const received = num(hraReceived);
  const rent = num(rentPaid);
  const base = num(basic);
  if (received === 0 || rent === 0) return 0;
  const share = metro ? caps.hraMetro : caps.hraNonMetro;
  return round(Math.max(0, Math.min(received, rent - base * caps.hraBasicShare, base * share)));
}

/**
 * One regime, start to finish. Returns the working, not just a number, so the
 * page can show every step.
 */
export function computeRegime(input = {}, regime = "new", financialYear = "2026-27") {
  const rules = rulesFor(financialYear);
  const spec = rules[regime] ?? rules.new;
  const caps = rules.caps;

  // Bonus is taxed as salary, so it joins gross. Other income is added to the
  // taxable total after deductions, because no salary deduction applies to it.
  const gross = num(input.gross_salary) + num(input.bonus);
  const otherIncome = num(input.other_income);
  const basic = num(input.basic_salary);
  const lines = [];
  let deductions = 0;

  const addLine = (label, amount, note) => {
    const value = Math.max(0, round(amount));
    if (value <= 0) return;
    lines.push({ label, amount: value, note });
    deductions += value;
  };

  addLine("Standard deduction", Math.min(spec.standardDeduction, gross), "Flat deduction for salaried people");

  const employerNps = Math.min(num(input.employer_nps), basic * caps.employerNpsRate);
  addLine("Employer NPS, 80CCD(2)", employerNps, `Capped at ${Math.round(caps.employerNpsRate * 100)}% of basic`);

  if (regime === "old") {
    addLine(
      "HRA exemption",
      hraExemption({ hraReceived: input.hra_received, rentPaid: input.rent_paid, basic, metro: Boolean(input.metro), caps }),
      "Least of HRA received, rent minus 10% of basic, and 50%/40% of basic",
    );
    addLine(
      "Section 80C",
      Math.min(num(input.employee_pf) + num(input.other_80c), caps.section80c),
      "PF, ELSS, PPF, life insurance and similar",
    );
    addLine("NPS, 80CCD(1B)", Math.min(num(input.employee_nps), caps.nps1b), "Extra ₹50,000 over 80C");
    addLine("Health insurance, 80D", Math.min(num(input.health_insurance), caps.health), "Premium paid for you or your parents");
    addLine("Home loan interest, 24(b)", Math.min(num(input.home_loan_interest), caps.homeLoanInterest), "Self-occupied property only");
    addLine("Other deductions", num(input.other_deductions), "80TTA, 80E and similar");
  }

  const taxable = Math.max(0, gross - deductions) + otherIncome;
  const baseTax = slabTax(taxable, spec.slabs);
  const rebate = taxable <= spec.rebate.taxableLimit ? Math.min(baseTax, spec.rebate.maxRebate) : 0;
  let tax = Math.max(0, baseTax - rebate);

  let marginalRelief = 0;
  if (spec.rebate.marginalRelief && taxable > spec.rebate.taxableLimit) {
    const cap = taxable - spec.rebate.taxableLimit;
    if (tax > cap) {
      marginalRelief = tax - cap;
      tax = cap;
    }
  }

  const surcharge = tax * surchargeRate(taxable, spec.surcharge);
  const cess = (tax + surcharge) * rules.cess;
  const total = tax + surcharge + cess;

  return {
    regime,
    label: spec.name,
    financialYear,
    rulesLabel: rules.label,
    gross,
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
  };
}

export function compareRegimes(input = {}, financialYear = "2026-27") {
  const oldRegime = computeRegime(input, "old", financialYear);
  const newRegime = computeRegime(input, "new", financialYear);
  const difference = oldRegime.total - newRegime.total;
  return {
    old: oldRegime,
    new: newRegime,
    better: difference === 0 ? "equal" : difference > 0 ? "new" : "old",
    saving: Math.abs(difference),
  };
}

/** Unused headroom under the common old-regime sections, for the suggestions list. */
export function savingOpportunities(input = {}, financialYear = "2026-27") {
  const caps = rulesFor(financialYear).caps;
  const used80c = num(input.employee_pf) + num(input.other_80c);
  const opportunities = [
    {
      label: "80C investments",
      remaining: Math.max(0, caps.section80c - used80c),
      note: "ELSS, PPF, EPF top-up or a term plan count here.",
    },
    {
      label: "Extra NPS, 80CCD(1B)",
      remaining: Math.max(0, caps.nps1b - num(input.employee_nps)),
      note: "An extra ₹50,000 a year over the 80C limit, locked until you are 60.",
    },
    {
      label: "Health insurance, 80D",
      remaining: Math.max(0, caps.health - num(input.health_insurance)),
      note: "Covers you and your parents, and pays for itself the first time you need it.",
    },
    {
      label: "Home loan interest, 24(b)",
      remaining: Math.max(0, caps.homeLoanInterest - num(input.home_loan_interest)),
      note: "Only for a self-occupied home, and only on the interest part.",
    },
  ];
  return opportunities.filter((item) => item.remaining > 0);
}

export function formatPercent(value) {
  return `${Number.isFinite(value) ? value : 0}%`;
}