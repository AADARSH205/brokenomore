const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CREDIT_FACTORS, creditEstimate } from "@/lib/money";

const BUREAUS = [
  { label: "TransUnion CIBIL", href: "https://www.cibil.com/freecibilscore" },
  { label: "Experian India", href: "https://www.experian.in/" },
  { label: "Equifax India", href: "https://www.equifax.co.in/" },
  { label: "CRIF High Mark", href: "https://www.crifhighmark.com/" },
];

export default function CreditScoreTool() {
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(CREDIT_FACTORS.map((factor) => [factor.key, factor.options[0].value])),
  );

  const result = useMemo(() => creditEstimate(answers), [answers]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <h3 className="text-xl font-semibold tracking-tight">Five things that decide your score</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Answer roughly. You get a range and the one change worth making first, not a pretend exact number.
        </p>

        <div className="mt-6 space-y-4">
          {CREDIT_FACTORS.map((factor) => {
            const id = `credit-${factor.key}`;
            return (
              <div key={factor.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={id} className="text-sm font-medium">
                    {factor.label}
                  </label>
                  <span className="text-xs text-muted-foreground">{Math.round(factor.weight * 100)}% of score</span>
                </div>
                <Select
                  value={answers[factor.key]}
                  onValueChange={(next) => {
                    setAnswers((current) => ({ ...current, [factor.key]: next }));
                    db.analytics.track({ eventName: "credit_factor_change" });
                  }}
                >
                  <SelectTrigger id={id} className="mt-1.5 h-11 w-full rounded-xl bg-card text-sm">
                    <SelectValue placeholder="Pick the closest" />
                  </SelectTrigger>
                  <SelectContent>
                    {factor.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-border bg-primary p-6 text-primary-foreground" aria-live="polite">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
            Estimated band
          </p>
          <p className="mt-2 font-display text-3xl font-semibold leading-tight">
            {result.band.label}: {result.band.min}–{result.band.max}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
            Your answers point to roughly {result.low}–{result.high} within that band. {result.band.note}
          </p>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-primary-foreground/70">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            This is an estimate from your own answers. It is not your credit score, and no bureau gave us
            any data.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Your biggest lever
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-base font-semibold">
            <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
            {result.lever.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.lever.fix}</p>

          <div className="mt-5 space-y-2">
            {result.breakdown.map((item) => (
              <div key={item.key} className="flex items-center gap-3 text-xs">
                <span className="w-32 shrink-0 text-muted-foreground">{item.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${Math.round(item.score * 100)}%` }}
                  />
                </span>
                <span className="w-8 text-right tabular-nums text-muted-foreground">
                  {Math.round(item.score * 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-secondary/60 p-6">
          <p className="text-sm font-medium">Get the real score, free</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Every bureau must give you one free full report a year. Start there, not with a paid app.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {BUREAUS.map((bureau) => (
              <li key={bureau.href}>
                <a
                  href={bureau.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
                >
                  {bureau.label}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Educational only. Not a credit score, not advice, and not a promise that any lender will say yes.
          </p>
        </div>
      </div>
    </div>
  );
}