const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useState } from "react";
import { AlertTriangle, Info, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

import { computeDailyNumber, formatINR, spendSplit } from "@/lib/money";

const FIELDS = [
  { key: "salary", label: "In-hand salary each month", hint: "What actually reaches your bank", min: 5000, max: 300000, step: 500 },
  { key: "bills", label: "Fixed bills each month", hint: "Rent, EMIs, phone, subscriptions", min: 0, max: 200000, step: 500 },
  { key: "savings", label: "Savings you want to set aside", hint: "What you refuse to spend", min: 0, max: 150000, step: 500 },
  { key: "days", label: "Days until your next salary", hint: "Count from today", min: 0, max: 60, step: 1 },
];

function NumberField({ field, value, onChange }) {
  const id = `calc-${field.key}`;
  const numeric = Number(value);
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {field.label}
        </label>
        <span className="text-xs text-muted-foreground">
          {field.hint}
          {field.key === "salary" && (
            <>
              {" · "}
              <a
                href="#tools"
                className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
              >
                Estimate from CTC →
              </a>
            </>
          )}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {field.key === "days" ? "" : "₹"}
          </span>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`h-11 w-28 rounded-xl border border-input bg-card px-3 text-sm font-medium tabular-nums text-foreground ${
              field.key === "days" ? "" : "pl-7"
            }`}
          />
        </div>
        <Slider
          aria-label={`${field.label}, slider`}
          value={[Number.isFinite(numeric) ? Math.min(field.max, Math.max(field.min, numeric)) : field.min]}
          min={field.min}
          max={field.max}
          step={field.step}
          onValueChange={([next]) => onChange(String(next))}
          className="flex-1"
        />
      </div>
    </div>
  );
}

export default function Calculator({ initialValues, onSync }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) return;
    const timer = setTimeout(() => onSync(values), 400);
    return () => clearTimeout(timer);
  }, [values, touched, onSync]);

  const result = computeDailyNumber(values);
  const split = spendSplit(result);

  const update = (key, next) => {
    setTouched(true);
    setValues((current) => ({ ...current, [key]: next }));
  };

  const share = async () => {
    const params = new URLSearchParams({
      salary: String(values.salary ?? ""),
      bills: String(values.bills ?? ""),
      savings: String(values.savings ?? ""),
      days: String(values.days ?? ""),
    });
    const url = `${window.location.origin}/?${params.toString()}#calculator`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Shareable link copied");
    } catch {
      toast("Copy this link to share", { description: url });
    }
    db.analytics.track({ eventName: "calculator_share" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="space-y-7">
          {FIELDS.map((field) => (
            <NumberField
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(next) => update(field.key, next)}
            />
          ))}
        </div>
        <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Nothing is saved on our servers. Your inputs live in the link so you can send the result to a
          friend or keep it open.
        </p>
      </div>

      <div className="flex flex-col justify-between rounded-3xl border border-border bg-primary p-6 text-primary-foreground shadow-soft sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
            Safe to spend today
          </p>

          <div aria-live="polite" aria-atomic="true">
            {result.status === "ok" && (
              <>
                <p className="mt-2 font-display text-[clamp(2.6rem,9vw,4rem)] leading-none tracking-tight">
                  {formatINR(result.daily)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  {formatINR(result.free)} left after bills and savings, spread across {result.days}{" "}
                  {result.days === 1 ? "day" : "days"}.
                </p>
              </>
            )}

            {result.status === "no-days" && (
              <>
                <p className="mt-2 font-display text-2xl leading-tight">Add the days until payday</p>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                  Set the days to at least 1 and the number appears here.
                </p>
              </>
            )}

            {result.status === "shortfall" && (
              <>
                <p className="mt-2 flex items-center gap-2 font-display text-2xl leading-tight text-amber-foreground">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                  Your month does not fit yet
                </p>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85">
                  Bills and savings come to {formatINR(result.setAside)}, which is{" "}
                  <strong>{formatINR(result.shortfall)} more</strong> than your {formatINR(result.inHand)}{" "}
                  in hand. Trim {formatINR(result.shortfall)} from bills or savings, or add to your income,
                  and we will show a number. We will never show a negative one.
                </p>
              </>
            )}
          </div>

          <div className="mt-7">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-primary-foreground/20" role="img" aria-label={`Bills ${split.bills} percent, savings ${split.savings} percent, free ${split.free} percent of your salary`}>
              <div className="h-full bg-amber" style={{ width: `${split.bills}%` }} />
              <div className="h-full bg-accent" style={{ width: `${split.savings}%` }} />
              <div className="h-full bg-primary-foreground/45" style={{ width: `${split.free}%` }} />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="flex items-center gap-1.5 text-primary-foreground/70">
                  <span className="h-2 w-2 rounded-full bg-amber" aria-hidden="true" /> Bills
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">{formatINR(result.fixedBills)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-primary-foreground/70">
                  <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" /> Savings
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">{formatINR(result.savingsGoal)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-primary-foreground/70">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/45" aria-hidden="true" /> Free
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">{formatINR(Math.max(0, result.free))}</dd>
              </div>
            </dl>
          </div>
        </div>

        <button
          type="button"
          onClick={share}
          className="mt-7 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Copy a shareable link
        </button>
      </div>
    </div>
  );
}