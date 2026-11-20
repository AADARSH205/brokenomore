import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactINR, formatINR, sipProjection } from "@/lib/money";

const SCENARIOS = [
  { label: "Conservative", rate: 8 },
  { label: "Moderate", rate: 10 },
  { label: "Optimistic", rate: 12 },
];

export default function SipCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");
  const [stepUp, setStepUp] = useState("0");

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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold tracking-tight">What could a SIP grow to?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Change any number to see the effect. This is arithmetic, not a prediction.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sip-monthly" className="text-sm font-medium">
            Monthly investment (₹)
          </label>
          <input
            id="sip-monthly"
            type="number"
            min="0"
            step="500"
            value={monthly}
            onChange={(event) => setMonthly(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums"
          />
        </div>
        <div>
          <label htmlFor="sip-years" className="text-sm font-medium">
            Years
          </label>
          <input
            id="sip-years"
            type="number"
            min="1"
            max="50"
            value={years}
            onChange={(event) => setYears(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums"
          />
        </div>
        <div>
          <label htmlFor="sip-rate" className="text-sm font-medium">
            Expected return (% a year)
          </label>
          <input
            id="sip-rate"
            type="number"
            min="0"
            max="30"
            step="0.5"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums"
          />
        </div>
        <div>
          <label htmlFor="sip-stepup" className="text-sm font-medium">
            Yearly increase in SIP (%)
          </label>
          <input
            id="sip-stepup"
            type="number"
            min="0"
            max="100"
            value={stepUp}
            onChange={(event) => setStepUp(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            type="button"
            onClick={() => setRate(String(scenario.rate))}
            className={
              Number(rate) === scenario.rate
                ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                : "rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            }
          >
            {scenario.label} · {scenario.rate}%
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-secondary/50 p-3">
        <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          The same amount, three return assumptions
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {SCENARIOS.map((scenario) => {
            const result = sipProjection({
              monthly: Number(monthly) || 0,
              years: Number(years) || 0,
              annualRate: scenario.rate,
              stepUpPercent: Number(stepUp) || 0,
            });
            return (
              <div key={scenario.label}>
                <p className="text-[11px] text-muted-foreground">
                  {scenario.label} · {scenario.rate}%
                </p>
                <p className="mt-0.5 font-display text-sm font-semibold tabular-nums">{formatINR(result.value)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Invested</p>
          <p className="mt-1 font-display text-lg font-semibold">{formatINR(projection.invested)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Est. value</p>
          <p className="mt-1 font-display text-lg font-semibold text-positive">{formatINR(projection.value)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Est. returns</p>
          <p className="mt-1 font-display text-lg font-semibold">{formatINR(projection.gains)}</p>
        </div>
      </div>

      <div className="mt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projection.series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sipValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${value}y`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => formatCompactINR(value)}
            />
            <Tooltip
              formatter={(value, name) => [formatINR(value), name === "value" ? "Estimated value" : "Invested"]}
              labelFormatter={(value) => `Year ${value}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="invested" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fill="url(#sipValue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Mutual fund returns are market-linked. A 12% assumption is a common long-term equity figure, not a promise.
        Actual returns can be lower, or negative, over any given period.
      </p>
    </div>
  );
}