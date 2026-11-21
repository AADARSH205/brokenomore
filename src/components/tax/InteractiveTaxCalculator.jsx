import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Info,
  Scale,
  Sparkles,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import TaxGuide from "@/components/site/TaxGuide";
import {
  compareRegimes,
  computeRegime,
  deductionValueBreakdown,
  estimateInHandSalary,
  rulesFor,
} from "@/lib/tax";
import { formatINR } from "@/lib/money";
import { TAX_CONFIG_2026_27 } from "@/data/tax-rules";

const DEFAULT_INPUTS = {
  gross_salary: "1200000",
  basic_salary: "540000",
  hra_received: "180000",
  rent_paid: "180000",
  metro: true,
  section_80c: "150000",
  section_80d: "25000",
  employer_nps: "0",
  employee_nps: "50000", // Section 124(3) / 80CCD(1B)
};

export default function InteractiveTaxCalculator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [activeSubTab, setActiveSubTab] = useState("breakdown");

  const update = (key, value) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      // If gross changes and basic hasn't been manually fine-tuned, suggest 45% basic
      if (key === "gross_salary" && Number(value) > 0 && !prev._basicEdited) {
        next.basic_salary = String(Math.round((Number(value) || 0) * 0.45));
      }
      return next;
    });
  };

  const handleBasicChange = (value) => {
    setInputs((prev) => ({
      ...prev,
      basic_salary: value,
      _basicEdited: true,
    }));
  };

  const numericInputs = useMemo(() => {
    const gross = Number(inputs.gross_salary) || 0;
    const basic = Number(inputs.basic_salary) || Math.round(gross * 0.45);
    return {
      gross_salary: gross,
      basic_salary: basic,
      hra_received: Number(inputs.hra_received) || 0,
      rent_paid: Number(inputs.rent_paid) || 0,
      metro: Boolean(inputs.metro),
      section_80c: Number(inputs.section_80c) || 0,
      section_80d: Number(inputs.section_80d) || 0,
      employer_nps: Number(inputs.employer_nps) || 0,
      employee_nps: Number(inputs.employee_nps) || 0,
    };
  }, [inputs]);

  const rules = rulesFor("2026-27");
  const comparison = useMemo(() => compareRegimes(numericInputs, "2026-27"), [numericInputs]);
  const deductionExplainer = useMemo(
    () => deductionValueBreakdown(numericInputs, "2026-27"),
    [numericInputs],
  );
  const inHandEstimator = useMemo(
    () => estimateInHandSalary(numericInputs, "2026-27"),
    [numericInputs],
  );

  const bestRegime = comparison.better === "old" ? comparison.old : comparison.new;
  const isZeroTax = bestRegime.total === 0;

  const handlePreFillSafeToSpend = () => {
    if (typeof window === "undefined") return;
    const targetSalary = String(inHandEstimator.monthlyInHand);
    const params = new URLSearchParams(window.location.search);
    params.set("salary", targetSalary);
    const nextUrl = `${window.location.pathname}?${params.toString()}#calculator`;
    window.location.href = nextUrl;
  };

  return (
    <div className="space-y-8">
      {/* HEADER & METADATA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
              FY 2026-27 (AY 2027-28)
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-positive" />
              Verified with incometax.gov.in
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Do I owe tax? Old vs New regime
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare both regimes with FY 2026-27 Budget slabs, Section 87A rebate (₹0 tax up to ₹12L taxable), standard deduction, and HRA.
          </p>
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <p>
            Last verified: <span className="font-medium text-foreground">{rules.verifiedOn}</span>
          </p>
          <a
            href={TAX_CONFIG_2026_27.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
          >
            Official IT portal
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* 1. RESULT FIRST BANNER (Required by Phase 2) */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div
          className={`p-6 sm:p-7 ${
            isZeroTax
              ? "bg-positive/10 border-b border-positive/20"
              : comparison.better === "new"
                ? "bg-primary/5 border-b border-primary/20"
                : "bg-accent-soft/40 border-b border-accent/20"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                isZeroTax
                  ? "bg-positive text-primary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isZeroTax ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Zero Tax Status
                </>
              ) : (
                <>
                  <Scale className="h-3.5 w-3.5" />
                  Calculator Result
                </>
              )}
            </span>

            {comparison.saving > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground border border-border shadow-sm">
                <TrendingDown className="h-3.5 w-3.5 text-positive" />
                Saves {formatINR(comparison.saving)} under {comparison.better === "new" ? "New" : "Old"}
              </span>
            )}
          </div>

          <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {comparison.headline}
          </h3>

          {/* Plain Words Zero Tax Explanation */}
          {bestRegime.isZeroTax && (
            <div className="mt-3 rounded-2xl bg-card/90 p-4 border border-positive/30 text-sm leading-relaxed text-foreground">
              <p className="font-semibold text-positive flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Zero tax explanation (plain English):
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {bestRegime.zeroTaxExplanation}
              </p>
            </div>
          )}
        </div>

        {/* REGIME SIDE-BY-SIDE CARDS */}
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {/* NEW REGIME CARD */}
          <div
            className={`p-6 ${
              comparison.better === "new" ? "bg-primary/5" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-lg font-bold">New Regime</h4>
                <p className="text-xs text-muted-foreground">Default for FY 2026-27</p>
              </div>
              {comparison.better === "new" && (
                <span className="rounded-full bg-positive-soft px-2.5 py-0.5 text-xs font-semibold text-positive">
                  Better for you
                </span>
              )}
            </div>

            <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground">
              {formatINR(comparison.new.total)}
            </p>
            <p className="text-xs text-muted-foreground">Total annual tax payable (incl. 4% cess)</p>

            <dl className="mt-5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Gross Salary</dt>
                <dd className="font-medium tabular-nums">{formatINR(comparison.new.gross)}</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Standard Deduction (Sec 16)</dt>
                <dd className="font-medium text-positive tabular-nums">-₹75,000</dd>
              </div>
              {comparison.new.lines.find((l) => l.section === "Sec 80CCD(2)") && (
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground">Employer NPS (80CCD(2))</dt>
                  <dd className="font-medium text-positive tabular-nums">
                    -{formatINR(comparison.new.lines.find((l) => l.section === "Sec 80CCD(2)").amount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Net Taxable Income</dt>
                <dd className="font-semibold tabular-nums">{formatINR(comparison.new.taxable)}</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Slab Tax (0-4L nil, 4-8L 5%...)</dt>
                <dd className="font-medium tabular-nums">{formatINR(comparison.new.baseTax)}</dd>
              </div>
              {comparison.new.rebate > 0 && (
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground">Section 87A Rebate</dt>
                  <dd className="font-medium text-positive tabular-nums">
                    -{formatINR(comparison.new.rebate)}
                  </dd>
                </div>
              )}
              {comparison.new.marginalRelief > 0 && (
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground">Marginal Relief</dt>
                  <dd className="font-medium text-positive tabular-nums">
                    -{formatINR(comparison.new.marginalRelief)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Health &amp; Education Cess (4%)</dt>
                <dd className="font-medium tabular-nums">{formatINR(comparison.new.cess)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="font-semibold text-foreground">Monthly TDS</dt>
                <dd className="font-bold tabular-nums text-foreground">{formatINR(comparison.new.monthly)}/mo</dd>
              </div>
            </dl>
          </div>

          {/* OLD REGIME CARD */}
          <div
            className={`p-6 ${
              comparison.better === "old" ? "bg-accent-soft/30" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-lg font-bold">Old Regime</h4>
                <p className="text-xs text-muted-foreground">With Chapter VI-A deductions</p>
              </div>
              {comparison.better === "old" && (
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Better for you
                </span>
              )}
            </div>

            <p className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground">
              {formatINR(comparison.old.total)}
            </p>
            <p className="text-xs text-muted-foreground">Total annual tax payable (incl. 4% cess)</p>

            <dl className="mt-5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Gross Salary</dt>
                <dd className="font-medium tabular-nums">{formatINR(comparison.old.gross)}</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Total Deductions Claimed</dt>
                <dd className="font-medium text-positive tabular-nums">-{formatINR(comparison.old.deductions)}</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Net Taxable Income</dt>
                <dd className="font-semibold tabular-nums">{formatINR(comparison.old.taxable)}</dd>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Slab Tax (0-2.5L nil, 2.5-5L 5%...)</dt>
                <dd className="font-medium tabular-nums">{formatINR(comparison.old.baseTax)}</dd>
              </div>
              {comparison.old.rebate > 0 && (
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <dt className="text-muted-foreground">Section 87A Rebate</dt>
                  <dd className="font-medium text-positive tabular-nums">
                    -{formatINR(comparison.old.rebate)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <dt className="text-muted-foreground">Health &amp; Education Cess (4%)</dt>
                <dd className="font-medium tabular-nums">{formatINR(comparison.old.cess)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="font-semibold text-foreground">Monthly TDS</dt>
                <dd className="font-bold tabular-nums text-foreground">{formatINR(comparison.old.monthly)}/mo</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE INPUTS GRID */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Adjust your numbers for FY 2026-27
          </h3>
          <button
            type="button"
            onClick={() => setInputs(DEFAULT_INPUTS)}
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Reset sample numbers
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* INCOME GROUP */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-background/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              1. Salary &amp; CTC
            </p>

            <div>
              <label htmlFor="tax-in-gross" className="text-xs font-medium text-foreground">
                Annual CTC / Gross Salary (₹)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-gross"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="10000"
                  value={inputs.gross_salary}
                  onChange={(e) => update("gross_salary", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-semibold tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Monthly gross: {formatINR(Math.round((Number(inputs.gross_salary) || 0) / 12))}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="tax-in-basic" className="text-xs font-medium text-foreground">
                  Annual Basic Salary (₹)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleBasicChange(String(Math.round((Number(inputs.gross_salary) || 0) * 0.5)))
                  }
                  className="text-[10px] text-primary underline underline-offset-1"
                >
                  Set 50%
                </button>
              </div>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-basic"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5000"
                  value={inputs.basic_salary}
                  onChange={(e) => handleBasicChange(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Used for HRA exemption and NPS percentage caps
              </p>
            </div>
          </div>

          {/* HOUSING & HRA GROUP */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-background/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              2. Housing &amp; Rent
            </p>

            <div>
              <label htmlFor="tax-in-hra" className="text-xs font-medium text-foreground">
                HRA received in year (₹)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-hra"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5000"
                  value={inputs.hra_received}
                  onChange={(e) => update("hra_received", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">From salary component</p>
            </div>

            <div>
              <label htmlFor="tax-in-rent" className="text-xs font-medium text-foreground">
                Rent paid in year (₹)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-rent"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5000"
                  value={inputs.rent_paid}
                  onChange={(e) => update("rent_paid", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Monthly rent: {formatINR(Math.round((Number(inputs.rent_paid) || 0) / 12))}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="tax-in-metro" className="text-xs text-foreground">
                Metro city (Delhi, Mumbai, Kolkata, Chennai)
              </label>
              <Switch
                id="tax-in-metro"
                checked={Boolean(inputs.metro)}
                onCheckedChange={(val) => update("metro", val)}
              />
            </div>
          </div>

          {/* DEDUCTIONS GROUP */}
          <div className="space-y-4 rounded-2xl border border-border/80 bg-background/50 p-4 md:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              3. Deductions &amp; NPS
            </p>

            <div>
              <label htmlFor="tax-in-80c" className="text-xs font-medium text-foreground">
                Section 80C (EPF, PPF, ELSS, Insurance)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-80c"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="150000"
                  step="5000"
                  value={inputs.section_80c}
                  onChange={(e) => update("section_80c", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Capped at ₹1.5 Lakh (Old regime only)</p>
            </div>

            <div>
              <label htmlFor="tax-in-80d" className="text-xs font-medium text-foreground">
                Section 80D Health Insurance (₹)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-80d"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="50000"
                  step="2500"
                  value={inputs.section_80d}
                  onChange={(e) => update("section_80d", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Self &amp; Parents (Old regime only)</p>
            </div>

            <div>
              <label htmlFor="tax-in-nps124" className="text-xs font-medium text-foreground">
                Employee NPS under Section 124(3) / 80CCD(1B)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-nps124"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="50000"
                  step="5000"
                  value={inputs.employee_nps}
                  onChange={(e) => update("employee_nps", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Voluntary NPS up to ₹50,000 (Old regime only)
              </p>
            </div>

            <div>
              <label htmlFor="tax-in-employer-nps" className="text-xs font-medium text-foreground">
                Employer NPS under Section 80CCD(2)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  id="tax-in-employer-nps"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5000"
                  value={inputs.employer_nps}
                  onChange={(e) => update("employer_nps", e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-card pl-7 pr-3 text-sm font-medium tabular-nums text-foreground"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Up to 14% of basic (Allowed in both New &amp; Old regimes!)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUB-TABS: WHERE EACH RUPEE HELPS, IN-HAND ESTIMATOR, DEDUCTIONS GUIDE */}
      <div className="w-full">
        <div
          role="tablist"
          aria-label="Tax calculator sections"
          className="inline-flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border border-border bg-card p-1.5 sm:w-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "breakdown"}
            onClick={() => setActiveSubTab("breakdown")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeSubTab === "breakdown"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            Where Deductions Help
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "inhand"}
            onClick={() => setActiveSubTab("inhand")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeSubTab === "inhand"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            In-Hand Salary Estimator
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === "guide"}
            onClick={() => setActiveSubTab("guide")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeSubTab === "guide"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            All Deductions Guide
          </button>
        </div>

        {/* TAB 1: WHERE EACH RUPEE OF DEDUCTIONS HELPS */}
        {activeSubTab === "breakdown" && (
          <div className="mt-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
              Where each rupee of deductions helps
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Analysis based on your salary and entered deductions.
            </p>

            {deductionExplainer.oldWins ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-positive/30 bg-positive-soft/30 p-4 text-xs sm:text-sm leading-relaxed text-foreground">
                  <p className="font-semibold text-positive flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Old Regime Wins For You
                  </p>
                  <p className="mt-1">{deductionExplainer.message}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 text-left">Deduction / Section</th>
                        <th className="pb-2 text-right">Amount Claimed</th>
                        <th className="pb-2 text-right">Marginal Tax Saved</th>
                        <th className="pb-2 text-left pl-4">Impact Explainer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {deductionExplainer.items.map((item) => (
                        <tr key={item.label} className="py-2.5">
                          <td className="py-2.5 font-medium text-foreground">
                            {item.label}
                            <span className="ml-1 text-[10px] text-muted-foreground font-mono">
                              ({item.section})
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-semibold tabular-nums text-foreground">
                            {formatINR(item.claimed)}
                          </td>
                          <td className="py-2.5 text-right font-bold text-positive tabular-nums">
                            {formatINR(item.taxSaved)}
                          </td>
                          <td className="py-2.5 pl-4 text-xs text-muted-foreground">
                            Saved at ~{item.marginalPercent}% effective slab rate
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-3 text-foreground">Total Deductions Claimed</td>
                        <td className="py-3 text-right text-foreground tabular-nums">
                          {formatINR(deductionExplainer.totalDeductions)}
                        </td>
                        <td className="py-3 text-right text-positive font-bold tabular-nums">
                          {formatINR(deductionExplainer.totalSaved)}
                        </td>
                        <td className="py-3 pl-4 text-xs font-normal text-muted-foreground">
                          Direct tax reduction
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-foreground">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">
                      Why deductions are not relevant for your numbers:
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      {deductionExplainer.message}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
                      <div className="rounded-xl border border-border bg-card p-3">
                        <span className="block font-semibold text-foreground">₹75,000</span>
                        <span className="text-muted-foreground">Flat New Regime standard deduction without proofs</span>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <span className="block font-semibold text-foreground">Up to ₹12 Lakh</span>
                        <span className="text-muted-foreground">Zero tax threshold under Section 87A rebate</span>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <span className="block font-semibold text-foreground">No Locked Capital</span>
                        <span className="text-muted-foreground">No need to lock money for 3-15 years in 80C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* TAB 2: IN-HAND SALARY ESTIMATOR (Required by Phase 2) */}
        {activeSubTab === "inhand" && (
          <div className="mt-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                  CTC to Monthly In-Hand Salary Estimator
                </h3>
                <p className="text-xs text-muted-foreground">
                  See what actually hits your bank account every month after PF, professional tax, and winning regime TDS.
                </p>
              </div>
              <span className="rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
                Calculated under {inHandEstimator.winningRegime}
              </span>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
                  <span className="text-muted-foreground">Annual CTC / Gross</span>
                  <span className="font-semibold tabular-nums">{formatINR(inHandEstimator.grossAnnual)}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
                  <span className="text-muted-foreground">Monthly Gross Salary</span>
                  <span className="font-medium tabular-nums">{formatINR(inHandEstimator.monthlyGross)}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
                  <span className="text-muted-foreground">Employee PF (12% of basic)</span>
                  <span className="font-medium text-destructive tabular-nums">-{formatINR(inHandEstimator.pfMonthly)}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
                  <span className="text-muted-foreground">Professional Tax (approx.)</span>
                  <span className="font-medium text-destructive tabular-nums">-{formatINR(inHandEstimator.profTaxMonthly)}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2 text-sm">
                  <span className="text-muted-foreground">Monthly Income Tax (TDS)</span>
                  <span className="font-medium text-destructive tabular-nums">
                    {inHandEstimator.monthlyTds > 0 ? `-${formatINR(inHandEstimator.monthlyTds)}` : "₹0 (Tax Free)"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-base font-bold text-foreground">
                  <span>Estimated Monthly Take-Home</span>
                  <span className="font-display text-lg text-positive tabular-nums">
                    {formatINR(inHandEstimator.monthlyInHand)} / mo
                  </span>
                </div>
              </div>

              {/* CARD LINKING TO SAFE-TO-SPEND CALCULATOR */}
              <div className="flex flex-col justify-between rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Connect with Daily Safe-to-Spend
                  </p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
                    {formatINR(inHandEstimator.monthlyInHand)}
                    <span className="text-xs font-normal text-muted-foreground"> / month in hand</span>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    This is your real spendable salary. Click below to automatically send this number into the Daily Safe-to-Spend calculator above to calculate your daily allowance.
                  </p>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handlePreFillSafeToSpend}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Use in Safe-to-Spend Calculator
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Pre-fills salary on the homepage calculator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 3: EXISTING DEDUCTIONS GUIDE (Reference) */}
        {activeSubTab === "guide" && (
          <div className="mt-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <TaxGuide />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DISCLAIMER (Required by Phase 2) */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">
              Educational only, not tax advice.
            </p>
            <p className="mt-0.5">
              Calculations are based on the Finance Act provisions for FY 2026-27 (AY 2027-28). Always verify your individual tax liability, deductions, and exemptions at{" "}
              <a
                href="https://www.incometax.gov.in"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-foreground underline underline-offset-2"
              >
                incometax.gov.in
              </a>{" "}
              or consult a certified Chartered Accountant before filing your tax returns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
