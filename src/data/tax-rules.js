// Indian income tax rules, kept in one updatable place.
// Verified against the Income Tax Department (incometax.gov.in) for FY 2026-27.
// When a Budget changes a slab, a limit, or a rebate, edit this file only.
// The engine in src/lib/tax.js reads every number from here.

import { getLastReviewedDate } from "../lib/format.js";

export const TAX_CONFIG_2026_27 = {
  label: "FY 2026-27",
  assessmentYear: "AY 2027-28",
  financialYear: "2026-27",
  get verifiedOn() {
    return getLastReviewedDate();
  },
  source: "Income Tax Department, Government of India",
  sourceUrl: "https://www.incometax.gov.in",
  cess: 0.04,
  caps: {
    section80c: 150000,
    nps1b: 50000, // Employee's own voluntary NPS under Section 124(3) / 80CCD(1B)
    health: 50000, // Section 80D (Self & Family up to 25k + Parents up to 25k/50k)
    healthSelf: 25000,
    healthParents: 25000,
    homeLoanInterest: 200000, // Section 24(b)
    employerNpsRate: 0.14, // Section 80CCD(2), up to 14% of basic
    hraMetro: 0.5,
    hraNonMetro: 0.4,
    hraBasicShare: 0.1,
    standardDeductionNew: 75000,
    standardDeductionOld: 50000,
    rebateLimitNew: 1200000,
    maxRebateNew: 60000,
    rebateLimitOld: 500000,
    maxRebateOld: 12500,
    professionalTax: 2400, // ~₹200/month in most states (capped at ₹2,500/year)
    statutoryPfCapMonthly: 1800, // 12% of ₹15,000 wage ceiling
  },
  new: {
    name: "New regime",
    tagline: "Lower slab rates, higher standard deduction (₹75k), rebate up to ₹12 Lakh. Default regime for FY 2026-27.",
    standardDeduction: 75000,
    slabs: [
      { upTo: 400000, rate: 0, label: "₹0 – ₹4 Lakh", rateLabel: "Nil" },
      { upTo: 800000, rate: 0.05, label: "₹4 Lakh – ₹8 Lakh", rateLabel: "5%" },
      { upTo: 1200000, rate: 0.1, label: "₹8 Lakh – ₹12 Lakh", rateLabel: "10%" },
      { upTo: 1600000, rate: 0.15, label: "₹12 Lakh – ₹16 Lakh", rateLabel: "15%" },
      { upTo: 2000000, rate: 0.2, label: "₹16 Lakh – ₹20 Lakh", rateLabel: "20%" },
      { upTo: 2400000, rate: 0.25, label: "₹20 Lakh – ₹24 Lakh", rateLabel: "25%" },
      { upTo: Infinity, rate: 0.3, label: "Above ₹24 Lakh", rateLabel: "30%" },
    ],
    rebate: {
      taxableLimit: 1200000,
      maxRebate: 60000,
      marginalRelief: true,
      description: "Section 87A rebate covers up to ₹60,000 tax for taxable income up to ₹12 Lakh (₹12.75 Lakh gross salary with standard deduction). Marginal relief protects incomes just above ₹12 Lakh.",
    },
    surcharge: [
      { above: 20000000, rate: 0.25 },
      { above: 10000000, rate: 0.15 },
      { above: 5000000, rate: 0.1 },
    ],
    allowed: [
      "Standard deduction of ₹75,000 for salaried employees",
      "Employer NPS contribution under Section 80CCD(2), up to 14% of basic",
    ],
    notAllowed: [
      "House rent allowance (HRA) exemption",
      "Section 80C investments (EPF, ELSS, PPF, life insurance)",
      "Section 80D health insurance premium",
      "Section 124(3) / 80CCD(1B) extra NPS contribution",
      "Section 24(b) home loan interest on self-occupied home",
    ],
  },
  old: {
    name: "Old regime",
    tagline: "Higher slab rates, but allows Chapter VI-A deductions (80C, 80D, HRA, Section 124(3) NPS).",
    standardDeduction: 50000,
    slabs: [
      { upTo: 250000, rate: 0, label: "₹0 – ₹2.5 Lakh", rateLabel: "Nil" },
      { upTo: 500000, rate: 0.05, label: "₹2.5 Lakh – ₹5 Lakh", rateLabel: "5%" },
      { upTo: 1000000, rate: 0.2, label: "₹5 Lakh – ₹10 Lakh", rateLabel: "20%" },
      { upTo: Infinity, rate: 0.3, label: "Above ₹10 Lakh", rateLabel: "30%" },
    ],
    rebate: {
      taxableLimit: 500000,
      maxRebate: 12500,
      marginalRelief: false,
      description: "Section 87A rebate covers up to ₹12,500 tax for taxable income up to ₹5 Lakh (₹5.5 Lakh gross salary with standard deduction).",
    },
    surcharge: [
      { above: 50000000, rate: 0.37 },
      { above: 20000000, rate: 0.25 },
      { above: 10000000, rate: 0.15 },
      { above: 5000000, rate: 0.1 },
    ],
    allowed: [
      "Standard deduction of ₹50,000",
      "HRA exemption on rent actually paid under Section 10(13A)",
      "Section 80C up to ₹1,50,000 (EPF, PPF, ELSS, term insurance)",
      "Section 124(3) / 80CCD(1B) extra voluntary NPS up to ₹50,000",
      "Section 80D health insurance premium up to ₹50,000",
      "Section 24(b) home loan interest up to ₹2,00,000",
      "Employer NPS contribution under Section 80CCD(2)",
    ],
    notAllowed: [],
  },
};

export const TAX_RULES = {
  "2026-27": TAX_CONFIG_2026_27,
};

export const CURRENT_FY = "2026-27";
export const FINANCIAL_YEARS = Object.keys(TAX_RULES);

export function rulesFor(financialYear) {
  return TAX_RULES[financialYear] ?? TAX_RULES[CURRENT_FY];
}
