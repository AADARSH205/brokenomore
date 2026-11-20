import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, HelpCircle, Shield, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/money";

export default function BeforeSipChecklist({
  monthlyExpenses = 25000,
  emergencySaved = 0,
  hasHighDebt = false,
  isInteractive = false,
}) {
  const [interactiveExpenses, setInteractiveExpenses] = useState(String(monthlyExpenses || 25000));
  const [debtCleared, setDebtCleared] = useState(!hasHighDebt);

  const expenses = isInteractive ? Math.max(5000, Number(interactiveExpenses) || 0) : Math.max(5000, monthlyExpenses);
  const minEmergency = expenses * 3;
  const targetEmergency = expenses * 6;
  const isEmergencyReady = emergencySaved >= minEmergency;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Checklist before investing
          </span>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Before your first SIP</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A SIP is a long-term commitment. Don't start a SIP only to break it in 3 months when an unexpected bill arrives.
          </p>
        </div>
      </div>

      {isInteractive && (
        <div className="mt-6 rounded-2xl border border-border/80 bg-secondary/30 p-4">
          <label htmlFor="checklist-expenses" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your monthly essential expenses (rent, bills, food)
          </label>
          <div className="relative mt-1.5 max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₹
            </span>
            <input
              id="checklist-expenses"
              type="number"
              inputMode="numeric"
              step="1000"
              min="5000"
              max="200000"
              value={interactiveExpenses}
              onChange={(e) => setInteractiveExpenses(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-card pl-8 pr-3 text-sm font-semibold tabular-nums"
            />
          </div>
        </div>
      )}

      {/* 3 STEPS CHECKLIST WITH GREEN / AMBER STATUS */}
      <div className="mt-6 space-y-4">
        {/* ITEM 1: EMERGENCY FUND */}
        <div
          className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between ${
            isEmergencyReady
              ? "border-positive/40 bg-positive-soft/20"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <div className="flex items-start gap-3">
            {isEmergencyReady ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold">1. Emergency Fund (3 to 6 months of expenses)</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    isEmergencyReady
                      ? "bg-positive-soft text-positive"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {isEmergencyReady ? "Ready (Green)" : "Priority 1 (Amber)"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Keep money safe in a liquid savings account or flexi-FD for rent, medical emergencies, or job changes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-lg bg-card px-3 py-1.5 border border-border">
                  Minimum (3 mo): <strong className="text-foreground">{formatINR(minEmergency)}</strong>
                </span>
                <span className="rounded-lg bg-card px-3 py-1.5 border border-border">
                  Recommended (6 mo): <strong className="text-primary">{formatINR(targetEmergency)}</strong>
                </span>
                {emergencySaved > 0 && (
                  <span className="rounded-lg bg-card px-3 py-1.5 border border-border">
                    Saved so far: <strong className="text-foreground">{formatINR(emergencySaved)}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ITEM 2: CLEAR HIGH-INTEREST DEBT */}
        <div
          className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between ${
            debtCleared
              ? "border-positive/40 bg-positive-soft/20"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <div className="flex items-start gap-3">
            {debtCleared ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold">2. Clear High-Interest Debt First</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    debtCleared
                      ? "bg-positive-soft text-positive"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {debtCleared ? "No high debt (Green)" : "Clear first (Amber)"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Credit cards charge 36% to 42% APR; personal loans charge 14% to 24%. No mutual fund can beat a 40% guaranteed negative return. Always pay credit card balances in full before starting an equity SIP.
              </p>
              {isInteractive && (
                <label className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debtCleared}
                    onChange={(e) => setDebtCleared(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
                  />
                  <span>I have zero revolving credit card balances or high-interest personal loans</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ITEM 3: START YOUR FIRST SIP */}
        <div
          className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between ${
            debtCleared && isEmergencyReady
              ? "border-positive/40 bg-positive-soft/20"
              : "border-border bg-card/60"
          }`}
        >
          <div className="flex items-start gap-3">
            <TrendingUp
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                debtCleared && isEmergencyReady ? "text-positive" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold">3. Ready for Your First SIP</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    debtCleared && isEmergencyReady
                      ? "bg-positive-soft text-positive"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {debtCleared && isEmergencyReady ? "Good to go (Green)" : "After steps 1 & 2"}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Once emergency funds and credit cards are under control, even ₹500 or ₹1,000 every month in a broad index fund puts compound interest on your side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
