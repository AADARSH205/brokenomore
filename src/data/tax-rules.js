// Indian income tax rules, kept in one updatable place.
// Verified against the Income Tax Department (incometax.gov.in) on the date below.
// When a Budget changes a slab, a limit or a rebate, edit this file only.
// The engine in src/lib/tax.js reads every number from here.

import { getLastReviewedDate } from "../lib/format.js";

export const TAX_RULES = {
  "2026-27": {
    label: "FY 2026-27",
    assessmentYear: "AY 2027-28",
    get verifiedOn() {
      return getLastReviewedDate();
    },
    source: "Income Tax Department, incometax.gov.in",
    cess: 0.04,
    caps: {
      section80c: 150000,
      nps1b: 50000,
      health: 50000,
      homeLoanInterest: 200000,
      employerNpsRate: 0.14,
      hraMetro: 0.5,
      hraNonMetro: 0.4,
      hraBasicShare: 0.1,
      professionalTax: 2500,
    },
    new: {
      name: "New regime",
      tagline: "Lower rates, almost no deductions. This is the default regime.",
      slabs: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.1 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.2 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: Infinity, rate: 0.3 },
      ],
      standardDeduction: 75000,
      rebate: { taxableLimit: 1200000, maxRebate: 60000, marginalRelief: true },
      surcharge: [
        { above: 20000000, rate: 0.25 },
        { above: 10000000, rate: 0.15 },
        { above: 5000000, rate: 0.1 },
      ],
      allowed: [
        "Standard deduction of ₹75,000",
        "Employer NPS contribution under 80CCD(2), up to 14% of basic",
      ],
      notAllowed: [
        "House rent allowance exemption",
        "80C investments (PF, ELSS, PPF, life insurance)",
        "80D health insurance premium",
        "Section 24(b) home loan interest on a self-occupied home",
        "80CCD(1B) extra NPS of ₹50,000",
      ],
    },
    old: {
      name: "Old regime",
      tagline: "Higher rates, but every deduction you can document counts.",
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.2 },
        { upTo: Infinity, rate: 0.3 },
      ],
      standardDeduction: 50000,
      rebate: { taxableLimit: 500000, maxRebate: 12500, marginalRelief: false },
      surcharge: [
        { above: 50000000, rate: 0.37 },
        { above: 20000000, rate: 0.25 },
        { above: 10000000, rate: 0.15 },
        { above: 5000000, rate: 0.1 },
      ],
      allowed: [
        "Standard deduction of ₹50,000",
        "HRA exemption on rent actually paid",
        "80C up to ₹1,50,000",
        "80CCD(1B) extra NPS up to ₹50,000",
        "80D health insurance premium",
        "24(b) home loan interest up to ₹2,00,000",
        "Employer NPS contribution under 80CCD(2)",
      ],
      notAllowed: [],
    },
  },
};

export const CURRENT_FY = "2026-27";
export const FINANCIAL_YEARS = Object.keys(TAX_RULES);

export function rulesFor(financialYear) {
  return TAX_RULES[financialYear] ?? TAX_RULES[CURRENT_FY];
}