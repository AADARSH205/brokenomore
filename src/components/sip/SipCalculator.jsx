import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeftRight, Check, HelpCircle, Info, Sparkles, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { formatCompactINR, formatINR, inflationAdjusted, reverseSip, sipProjection } from "@/lib/money";

const SCENARIOS = [
  { rate: 8, label: "Conservative (8%)", desc: "Debt-heavy / Hybrid" },
  { rate: 10, label: "Moderate (10%)", desc: "Large-cap & Nifty 50 Index" },
  { rate: 12, label: "Optimistic (12%)", desc: "Broad diversified equity" },
];

export default function SipCalculator({ className = "" }) {
  // Mode: "forward" (monthly -> future value) or "reverse" (target wealth -> required monthly SIP)
  const [isReverse, setIsReverse] = useState(false);
  const [monthly, setMonthly] = useState("5000");
  const [targetWealth, setTargetWealth] = useState("2500000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");
  const [stepUp, setStepUp] = useState("10");
  const [adjustInflation, setAdjustInflation] = useState(false);

  // Compute forward projection
  const forwardProjection = useMemo(() => {
    return sipProjection({
      monthly: Number(monthly) || 0,
      years: Number(years) || 0,
      annualRate: Number(rate) || 0,
      stepUpPercent: Number(stepUp) || 0,
    });
  }, [monthly, years, rate, stepUp]);

  // Compute reverse calculation
  const reverseResult = useMemo(() => {
    return reverseSip({
      targetWealth: Number(targetWealth) || 0,
      years: Number(years) || 0,
      annualRate: Number(rate) || 0,
      stepUpPercent: Number(stepUp) || 0,
    });
  }, [targetWealth, years, rate, stepUp]);

  // If in reverse mode, display chart using the calculated required monthly amount
  const activeProjection = useMemo(() => {
    if (isReverse) {
      return (
        sipProjection({
          monthly: reverseResult?.monthly || 0,
          years: Number(years) || 0,
          annualRate: Number(rate) || 0,
          stepUpPercent: Number(stepUp) || 0,
        }) || { series: [], value: 0, invested: 0, gains: 0 }
      );
    }
    return forwardProjection || { series: [], value: 0, invested: 0, gains: 0 };
  }, [isReverse, reverseResult?.monthly, forwardProjection, years, rate, stepUp]);

  // Adjust for inflation if toggled (6% inflation benchmark)
  const displayValue = adjustInflation
    ? inflationAdjusted(activeProjection?.value || 0, Number(years) || 0, 6)
    : (activeProjection?.value || 0);

  const displayGains = Math.max(0, displayValue - (activeProjection?.invested || 0));

  // Chart data with inflation adjustment support
  const chartData = useMemo(() => {
    return (activeProjection?.series || []).map((item) => ({
      year: item.year,
      invested: item.invested,
      value: adjustInflation ? inflationAdjusted(item.value, item.year, 6) : item.value,
    }));
  }, [activeProjection?.series, adjustInflation]);

  return (
    <div className={`rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 ${className}`}>
      {/* HEADER WITH MODE TOGGLE & INFLATION TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
              <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              SIP Planner
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Illustrative, not guaranteed
            </span>
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            {isReverse ? "Target to Monthly SIP (Reverse Mode)" : "What could a SIP grow to?"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isReverse
              ? "Tell us how much you want in the future, and we'll calculate the monthly SIP needed."
              : "Compounding rewards early discipline. Change any input to see the mathematics."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* REVERSE MODE BUTTON */}
          <button
            type="button"
            onClick={() => setIsReverse((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-primary" />
            {isReverse ? "Switch to Normal SIP" : "Switch to Reverse Mode"}
          </button>

          {/* INFLATION TOGGLE */}
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-2">
            <Switch
              id="sip-inflation"
              checked={adjustInflation}
              onCheckedChange={setAdjustInflation}
            />
            <label htmlFor="sip-inflation" className="text-xs font-medium text-foreground cursor-pointer">
              Inflation-adjusted (6%)
            </label>
          </div>
        </div>
      </div>

      {/* INPUTS GRID */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isReverse ? (
          <div>
            <label htmlFor="target-wealth" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Target Wealth Goal (₹)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <input
                id="target-wealth"
                type="number"
                inputMode="numeric"
                min="50000"
                step="50000"
                value={targetWealth}
                onChange={(e) => setTargetWealth(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="sip-monthly-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Monthly SIP (₹)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <input
                id="sip-monthly-input"
                type="number"
                inputMode="numeric"
                min="500"
                step="500"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="sip-years-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Time horizon (Years)
          </label>
          <div className="relative mt-1.5">
            <input
              id="sip-years-input"
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              Years
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="sip-rate-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Expected return (% p.a.)
          </label>
          <div className="relative mt-1.5">
            <input
              id="sip-rate-input"
              type="number"
              inputMode="decimal"
              min="1"
              max="25"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="sip-stepup-input" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Annual step-up (% each year)
          </label>
          <div className="relative mt-1.5">
            <input
              id="sip-stepup-input"
              type="number"
              inputMode="numeric"
              min="0"
              max="50"
              value={stepUp}
              onChange={(e) => setStepUp(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold tabular-nums"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %/yr
            </span>
          </div>
        </div>
      </div>

      {/* THREE RETURN SCENARIOS (8%, 10%, 12%) - LABELLED ILLUSTRATIVE, NOT GUARANTEED */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Three return scenarios:</span>
        {SCENARIOS.map((sc) => {
          const isSelected = Number(rate) === sc.rate;
          return (
            <button
              key={sc.rate}
              type="button"
              onClick={() => setRate(String(sc.rate))}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {sc.label}
            </button>
          );
        })}
        <span className="text-[11px] text-muted-foreground italic ml-auto">
          Illustrative scenarios, not guaranteed
        </span>
      </div>

      {/* SUMMARY RESULT CARDS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {isReverse ? (
          <>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Required Monthly SIP</p>
              <p className="mt-1.5 font-display text-3xl font-bold text-primary">{formatINR(reverseResult.monthly)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                To reach {formatINR(Number(targetWealth) || 0)} in {years} years at {rate}%
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Principal Invested</p>
              <p className="mt-1.5 font-display text-2xl font-bold">{formatINR(activeProjection.invested)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Out of your bank salary</p>
            </div>
            <div className="rounded-2xl border border-positive/30 bg-positive-soft/30 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {adjustInflation ? "Purchasing Power (Real)" : "Final Target Wealth"}
              </p>
              <p className="mt-1.5 font-display text-2xl font-bold text-positive">{formatINR(displayValue)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {adjustInflation ? "In today's value after 6% inflation" : "Nominal expected corpus"}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Invested</p>
              <p className="mt-1.5 font-display text-2xl font-bold">{formatINR(activeProjection.invested)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatINR(Number(monthly) || 0)}/mo with {stepUp}% annual step-up
              </p>
            </div>
            <div className="rounded-2xl border border-positive/30 bg-positive-soft/30 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Estimated Gains</p>
              <p className="mt-1.5 font-display text-2xl font-bold text-positive">{formatINR(displayGains)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Compound wealth creation</p>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {adjustInflation ? "Inflation-Adjusted Value" : "Total Expected Wealth"}
              </p>
              <p className="mt-1.5 font-display text-3xl font-bold text-primary">{formatINR(displayValue)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {adjustInflation ? "Purchasing power in today's rupees (6% inflation)" : `After ${years} years at ${rate}% p.a.`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* GROWTH CHART */}
      <div className="mt-6 h-60 w-full min-h-[240px] pt-2">
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sipWealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${v}y`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => formatCompactINR(v)}
            />
            <Tooltip
              formatter={(val, name) => [
                formatINR(val),
                name === "value"
                  ? adjustInflation
                    ? "Real Value (Today's ₹)"
                    : "Total Wealth"
                  : "Principal Invested",
              ]}
              labelFormatter={(l) => `End of Year ${l}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="hsl(var(--muted-foreground))"
              fill="transparent"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="url(#sipWealthGrad)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER DISCLAIMER */}
      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p>
            <strong>Note:</strong> Mutual fund investments are subject to market risks. Projections are mathematical illustrations based on assumed compound rates and do not guarantee future returns. BrokeNoMore is not an investment adviser.
          </p>
        </div>
      </div>
    </div>
  );
}
