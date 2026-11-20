import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactINR, formatINR, sipProjection } from "@/lib/money";

const SCENARIOS = [
  { label: "Conservative", rate: 8, desc: "Debt-heavy / Balanced hybrid" },
  { label: "Moderate", rate: 10, desc: "Large-cap & Index funds" },
  { label: "Optimistic", rate: 12, desc: "Broad diversified equity" },
];

export default function InvestTool() {
  const [monthly, setMonthly] = useState("5000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");
  const [stepUp, setStepUp] = useState("10");

  const projection = useMemo(
    () =>
      sipProjection({
        monthly: Number(monthly) || 0,
        years: Number(years) || 0,
        annualRate: Number(rate) || 0,
        stepUpPercent: Number(stepUp) || 0,
      }),
    [monthly, years, rate, stepUp],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Your first SIP projection</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            See what a disciplined monthly amount could grow to. Compound interest rewards starting early, not starting rich.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          Illustrative, not guaranteed
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="invest-monthly" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly SIP
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="invest-monthly"
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

        <div>
          <label htmlFor="invest-years" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Time horizon
          </label>
          <div className="relative mt-1.5">
            <input
              id="invest-years"
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
          <label htmlFor="invest-rate" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Expected return (% p.a.)
          </label>
          <div className="relative mt-1.5">
            <input
              id="invest-rate"
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
          <label htmlFor="invest-stepup" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Annual step-up (%)
          </label>
          <div className="relative mt-1.5">
            <input
              id="invest-stepup"
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Presets:</span>
        {SCENARIOS.map((sc) => (
          <button
            key={sc.label}
            type="button"
            onClick={() => setRate(String(sc.rate))}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              Number(rate) === sc.rate
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {sc.label} ({sc.rate}%)
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Invested</p>
          <p className="mt-1.5 font-display text-2xl font-bold">{formatINR(projection.invested)}</p>
          <p className="mt-1 text-xs text-muted-foreground">From your monthly salary</p>
        </div>
        <div className="rounded-2xl border border-positive/30 bg-positive-soft/40 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated Gains</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-positive">{formatINR(projection.gains)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Compounded growth</p>
        </div>
        <div className="rounded-2xl border border-accent/40 bg-accent-soft/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Expected Wealth</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-accent">{formatINR(projection.value)}</p>
          <p className="mt-1 text-xs text-muted-foreground">After {years} years at {rate}% p.a.</p>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projection.series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.0} />
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
              formatter={(val, name) => [formatINR(val), name === "value" ? "Total Wealth" : "Principal Invested"]}
              labelFormatter={(l) => `End of Year ${l}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="invested" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fill="url(#wealthGrad)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2.5">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. Projections are mathematical illustrations and do not guarantee returns.
          </p>
        </div>
        <Link
          to="/register"
          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start free
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
