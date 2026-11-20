import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveBudget } from "@/lib/finance-fns";
import { CATEGORIES } from "@/lib/categories";
import { budgetStatus, totalsByCategory } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

const BAR = { ok: "bg-positive", watch: "bg-warning", over: "bg-destructive", none: "bg-muted-foreground/40" };

export default function BudgetEditor({ month, budgets = [], expenses = [], onSaved }) {
  const save = useServerFn(saveBudget);
  const spent = totalsByCategory(expenses);
  const saved = useMemo(
    () => Object.fromEntries(budgets.map((budget) => [budget.category, Number(budget.limit_amount) || 0])),
    [budgets],
  );
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(
      Object.fromEntries(CATEGORIES.map((item) => [item.value, saved[item.value] ? String(saved[item.value]) : ""])),
    );
  }, [saved, month]);

  const changed = CATEGORIES.filter(
    (item) => (Number(values[item.value]) || 0) !== (saved[item.value] ?? 0),
  );
  const totalLimit = CATEGORIES.reduce((sum, item) => sum + (Number(values[item.value]) || 0), 0);
  const totalSpentInLimits = CATEGORIES.reduce(
    (sum, item) => sum + ((Number(values[item.value]) || 0) > 0 ? spent[item.value] ?? 0 : 0),
    0,
  );

  const submit = async (event) => {
    event.preventDefault();
    if (changed.length === 0) {
      toast("Nothing to save yet. Change a limit first.");
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        changed.map((item) =>
          save({
            data: {
              month,
              category: item.value,
              limit_amount: Number(values[item.value]) || 0,
            },
          }),
        ),
      );
      toast.success("Budget limits saved");
      onSaved?.();
    } catch (error) {
      toast.error(error?.message || "Those limits did not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight">Category limits</h2>
        <p className="text-xs text-muted-foreground">
          {formatINR(totalSpentInLimits)} spent of {formatINR(totalLimit)} budgeted
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Leave a category blank to skip it. Set a limit to zero to remove it.
      </p>

      <ul className="mt-4 space-y-3">
        {CATEGORIES.map((item) => {
          const limit = Number(values[item.value]) || 0;
          const status = budgetStatus(limit, spent[item.value] ?? 0);
          return (
            <li key={item.value} className="grid grid-cols-[1fr_7rem] items-center gap-3 sm:grid-cols-[1fr_9rem_1fr]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatINR(status.spent)} spent
                  {status.state === "over" ? " · over limit" : status.state === "watch" ? " · nearly there" : ""}
                </p>
              </div>
              <label className="sr-only" htmlFor={`budget-${item.value}`}>
                {item.label} limit
              </label>
              <input
                id={`budget-${item.value}`}
                type="number"
                min="0"
                step="100"
                inputMode="numeric"
                value={values[item.value] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [item.value]: event.target.value }))}
                placeholder="—"
                className="h-9 w-full rounded-lg border border-input bg-background px-2 text-right text-sm tabular-nums"
              />
              <div className="hidden sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full", BAR[status.state])}
                    style={{ width: `${Math.min(100, status.pct)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {limit > 0
                    ? status.remaining >= 0
                      ? `${formatINR(status.remaining)} left`
                      : `${formatINR(Math.abs(status.remaining))} over`
                    : "No limit set"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          {changed.length === 0 ? "Everything saved" : `${changed.length} change${changed.length === 1 ? "" : "s"} ready`}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Save limits
        </button>
      </div>
    </form>
  );
}