import { categoryMeta } from "@/lib/categories";
import { budgetStatus, totalsByCategory } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

const BAR = {
  ok: "bg-positive",
  half: "bg-amber",
  watch: "bg-warning",
  over: "bg-destructive",
  none: "bg-muted-foreground/40",
};

/** Category limits with the 80% and over-budget states spelled out. */
export default function BudgetProgress({ budgets = [], expenses = [], emptyHint }) {
  const spent = totalsByCategory(expenses);

  if (budgets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyHint ?? "No category limits yet. Set a few in the budget planner and they show up here."}
      </p>
    );
  }

  const rows = budgets
    .map((budget) => ({ budget, status: budgetStatus(budget.limit_amount, spent[budget.category] ?? 0) }))
    .sort((a, b) => b.status.pct - a.status.pct);

  return (
    <ul className="space-y-4">
      {rows.map(({ budget, status }) => {
        const meta = categoryMeta(budget.category);
        return (
          <li key={budget.id ?? budget.category}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">{meta.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatINR(status.spent)} of {formatINR(status.limit)}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full transition-all", BAR[status.level])}
                style={{ width: `${Math.min(100, status.pct)}%` }}
                role="progressbar"
                aria-valuenow={status.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${meta.label} budget used`}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {status.level === "over"
                ? `Over by ${formatINR(Math.abs(status.remaining))}. Pause this category until payday.`
                : status.level === "watch"
                  ? `${status.pct}% used. ${formatINR(status.remaining)} left, so slow down a little.`
                  : status.level === "half"
                    ? `Half the limit used. ${formatINR(status.remaining)} left for the rest of the month.`
                    : `${formatINR(status.remaining)} left this month.`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}