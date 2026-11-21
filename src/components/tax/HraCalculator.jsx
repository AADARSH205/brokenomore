import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, HelpCircle, Info, Landmark, ShieldCheck, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/money";
import { hraExemption } from "@/lib/tax";
import { trackCalculatorUsed } from "@/lib/analytics";

export default function HraCalculator({ className = "" }) {
  const [basic, setBasic] = useState("480000"); // 40k/mo basic
  const [hraReceived, setHraReceived] = useState("240000"); // 20k/mo HRA
  const [rentPaid, setRentPaid] = useState("180000"); // 15k/mo rent
  const [metro, setMetro] = useState(true);

  const basicNum = Math.max(0, Number(basic) || 0);
  const hraNum = Math.max(0, Number(hraReceived) || 0);
  const rentNum = Math.max(0, Number(rentPaid) || 0);

  // The 3 statutory tests:
  const test1Actual = hraNum;
  const test2Percent = metro ? basicNum * 0.5 : basicNum * 0.4;
  const test3RentMinusTen = Math.max(0, rentNum - 0.1 * basicNum);

  const exemptAmount = useMemo(() => {
    trackCalculatorUsed("hra", { basic: basicNum, rent: rentNum });
    return hraExemption({
      basic: basicNum,
      hraReceived: hraNum,
      rentPaid: rentNum,
      metro,
      caps: { hraMetro: 0.5, hraNonMetro: 0.4, hraBasicShare: 0.1 },
    });
  }, [basicNum, hraNum, rentNum, metro]);

  const taxableHra = Math.max(0, hraNum - exemptAmount);

  return (
    <div className={`rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            Section 10(13A) Exemption
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">HRA Exemption Calculator</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Calculate how much of your House Rent Allowance is tax-free under Indian Income Tax rules.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="hra-basic" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Annual Basic Salary (₹)
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="hra-basic"
              type="number"
              inputMode="numeric"
              step="5000"
              value={basic}
              onChange={(e) => setBasic(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Check your payslip. Usually 40% to 50% of your total CTC.
          </p>
        </div>

        <div>
          <label htmlFor="hra-received" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Annual HRA Received from Employer (₹)
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="hra-received"
              type="number"
              inputMode="numeric"
              step="5000"
              value={hraReceived}
              onChange={(e) => setHraReceived(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            The HRA component listed under your earnings.
          </p>
        </div>

        <div>
          <label htmlFor="hra-rent" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Annual Total Rent Paid (₹)
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="hra-rent"
              type="number"
              inputMode="numeric"
              step="5000"
              value={rentPaid}
              onChange={(e) => setRentPaid(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Actual rent paid to landlord across the 12 months.
          </p>
        </div>

        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 cursor-pointer hover:bg-secondary/40 transition-colors">
            <input
              type="checkbox"
              checked={metro}
              onChange={(e) => setMetro(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">Metro City</p>
              <p className="text-xs text-muted-foreground">
                Delhi, Mumbai, Kolkata, or Chennai (50% of basic; others 40%)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* RESULT CARDS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-positive/30 bg-positive-soft/30 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Exempt HRA (Tax-Free)
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-positive">{formatINR(exemptAmount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Deducted straight from your taxable salary in the Old Regime
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Taxable HRA Balance
          </p>
          <p className="mt-1.5 font-display text-3xl font-bold text-foreground">{formatINR(taxableHra)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Added to your taxable income under Salary
          </p>
        </div>
      </div>

      {/* HOW THE 3 STATUTORY TESTS WORK */}
      <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5">
        <h3 className="text-sm font-semibold text-foreground">How the Income Tax Department computes your exemption:</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Under Section 10(13A) Rule 2A, your exemption is the <strong>least</strong> of these three tests:
        </p>

        <div className="mt-3 space-y-2 text-xs">
          <div className={`flex justify-between items-center p-3 rounded-xl border ${exemptAmount === test1Actual ? "border-positive bg-positive-soft/30 font-semibold" : "border-border bg-card"}`}>
            <span>1. Actual HRA received from employer</span>
            <span className="font-mono text-sm">{formatINR(test1Actual)}</span>
          </div>
          <div className={`flex justify-between items-center p-3 rounded-xl border ${exemptAmount === test2Percent ? "border-positive bg-positive-soft/30 font-semibold" : "border-border bg-card"}`}>
            <span>2. {metro ? "50%" : "40%"} of Basic Salary ({metro ? "Metro" : "Non-Metro"})</span>
            <span className="font-mono text-sm">{formatINR(test2Percent)}</span>
          </div>
          <div className={`flex justify-between items-center p-3 rounded-xl border ${exemptAmount === test3RentMinusTen ? "border-positive bg-positive-soft/30 font-semibold" : "border-border bg-card"}`}>
            <span>3. Rent paid minus 10% of Basic salary ({formatINR(rentNum)} - {formatINR(basicNum * 0.1)})</span>
            <span className="font-mono text-sm">{formatINR(test3RentMinusTen)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="text-xs text-foreground/90">
          <strong>Note:</strong> HRA exemption is exclusively available under the <strong>Old Tax Regime</strong>. Compare your total tax to see if Old or New regime saves you more money overall.
        </div>
        <Link
          to="/old-vs-new-tax-regime-calculator"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Compare Old vs New
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
