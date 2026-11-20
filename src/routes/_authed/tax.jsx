import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/app/PageHeader";
import TaxForm from "@/components/tax/TaxForm";
import TaxComparison from "@/components/tax/TaxComparison";
import TaxChecklist from "@/components/tax/TaxChecklist";
import useFinanceData from "@/hooks/useFinanceData";
import { saveTaxProfile } from "@/lib/finance-fns";
import { compareRegimes, savingOpportunities } from "@/lib/tax";
import { CURRENT_FY, FINANCIAL_YEARS, rulesFor } from "@/data/tax-rules";
import { formatINR } from "@/lib/money";

export const Route = createFileRoute("/_authed/tax")({
  ssr: false,
  head: () => ({ meta: [{ title: "Tax planner — BrokeNoMore" }] }),
  component: TaxPage,
});

const BLANK = {
  financial_year: CURRENT_FY,
  gross_salary: "",
  bonus: "",
  other_income: "",
  basic_salary: "",
  hra_received: "",
  rent_paid: "",
  metro: false,
  employee_pf: "",
  other_80c: "",
  employee_nps: "",
  employer_nps: "",
  health_insurance: "",
  home_loan_interest: "",
  other_deductions: "",
};

const NUMERIC_KEYS = Object.keys(BLANK).filter((key) => key !== "financial_year" && key !== "metro");

function TaxPage() {
  const { taxProfile, profile, loading, reload } = useFinanceData(undefined, ["taxProfile", "profile"]);
  const [form, setForm] = useState(BLANK);
  const [checklist, setChecklist] = useState([]);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(saveTaxProfile);

  // Fill the form once, from the saved figures or the salary on the dashboard.
  // After that the person's own edits are never overwritten.
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current || (!taxProfile && !profile)) return;
    initialised.current = true;
    if (!taxProfile) {
      const monthly = Number(profile?.monthly_income) || 0;
      if (monthly > 0) {
        setForm((current) => ({
          ...current,
          gross_salary: String(monthly * 12),
          basic_salary: String(Math.round(monthly * 12 * 0.45)),
        }));
      }
      return;
    }
    setChecklist(Array.isArray(taxProfile.checklist) ? taxProfile.checklist : []);
    setForm({
      financial_year: taxProfile.financial_year ?? CURRENT_FY,
      gross_salary: String(taxProfile.gross_salary ?? ""),
      bonus: String(taxProfile.bonus ?? ""),
      other_income: String(taxProfile.other_income ?? ""),
      basic_salary: String(taxProfile.basic_salary ?? ""),
      hra_received: String(taxProfile.hra_received ?? ""),
      rent_paid: String(taxProfile.rent_paid ?? ""),
      metro: Boolean(taxProfile.metro),
      employee_pf: String(taxProfile.employee_pf ?? ""),
      other_80c: String(taxProfile.other_80c ?? ""),
      employee_nps: String(taxProfile.employee_nps ?? ""),
      employer_nps: String(taxProfile.employer_nps ?? ""),
      health_insurance: String(taxProfile.health_insurance ?? ""),
      home_loan_interest: String(taxProfile.home_loan_interest ?? ""),
      other_deductions: String(taxProfile.other_deductions ?? ""),
    });
  }, [taxProfile, profile]);

  const numeric = useMemo(() => {
    const out = { metro: Boolean(form.metro) };
    for (const key of NUMERIC_KEYS) out[key] = Number(form[key]) || 0;
    return out;
  }, [form]);

  const rules = rulesFor(form.financial_year);
  const comparison = useMemo(() => compareRegimes(numeric, form.financial_year), [numeric, form.financial_year]);
  const opportunities = useMemo(() => savingOpportunities(numeric, form.financial_year), [numeric, form.financial_year]);

  const submit = async (event) => {
    event.preventDefault();
    if (!(Number(form.gross_salary) > 0)) {
      toast.error("Enter your annual salary first.");
      return;
    }
    setSaving(true);
    try {
      await save({
        data: {
          id: taxProfile?.id,
          financial_year: form.financial_year,
          gross_salary: Number(form.gross_salary) || 0,
          bonus: Number(form.bonus) || 0,
          other_income: Number(form.other_income) || 0,
          checklist,
          basic_salary: Number(form.basic_salary) || 0,
          hra_received: Number(form.hra_received) || 0,
          rent_paid: Number(form.rent_paid) || 0,
          metro: Boolean(form.metro),
          employee_pf: Number(form.employee_pf) || 0,
          other_80c: Number(form.other_80c) || 0,
          employee_nps: Number(form.employee_nps) || 0,
          employer_nps: Number(form.employer_nps) || 0,
          health_insurance: Number(form.health_insurance) || 0,
          home_loan_interest: Number(form.home_loan_interest) || 0,
          other_deductions: Number(form.other_deductions) || 0,
        },
      });
      toast.success("Tax details saved");
      reload();
    } catch (error) {
      toast.error(error?.message || "That did not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-full bg-secondary" />
        <div className="h-64 animate-pulse rounded-2xl bg-secondary" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <PageHeader
        eyebrow="Tax planner"
        title="Old regime or new: do the maths once"
        description="Every number below comes from the tax rules for the financial year shown. Nothing is filed for you."
        actions={
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save details
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-positive-soft px-2.5 py-1 font-medium text-positive">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {rules.label} · {rules.assessmentYear}
        </span>
        <span>Rules last verified {rules.verifiedOn} against {rules.source}.</span>
        <label className="ml-auto flex items-center gap-2">
          <span>Financial year</span>
          <select
            value={form.financial_year}
            onChange={(event) => setForm((current) => ({ ...current, financial_year: event.target.value }))}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
          >
            {FINANCIAL_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <TaxForm form={form} onChange={setForm} />
        </div>
        <div>
          <TaxComparison comparison={comparison} rules={rules} />
        </div>
      </div>

      {opportunities.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-lg font-semibold tracking-tight">Headroom you are not using</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These only reduce tax under the old regime. Under the new regime the same investments are still worth
            making for the returns, not for the deduction.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {opportunities.map((item) => (
              <li key={item.label} className="rounded-xl bg-secondary/60 px-3 py-2.5">
                <p className="text-sm font-medium">
                  {item.label}: {formatINR(item.remaining)} unused
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{item.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TaxChecklist value={checklist} onChange={setChecklist} />

      <p className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        This is an estimate for planning, not tax advice or a filing. It ignores surcharge marginal relief,
        professional tax, allowances that are exempt in part, and anything specific to your employer's payroll.
        Confirm with a chartered accountant before acting, and check the rules for your own financial year on
        incometax.gov.in.
      </p>
    </form>
  );
}