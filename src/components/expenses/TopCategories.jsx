import { categoryMeta } from "@/lib/categories";
import { categoryTotalsList, sumExpenses, totalsByCategory } from "@/lib/finance";
import { formatINR } from "@/lib/money";

/** The five categories that took the most this month, with the change on last month. */
export default function TopCategories({ expenses = [], previous = [], title = "Biggest categories" }) {
  const rows = categoryTotalsList(expenses).slice(0, 5);
  const total = sumExpenses(expenses);
  const before = totalsByCategory(previous);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing recorded this month yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const meta = categoryMeta(row.category);
            const share = total > 0 ? Math.round((row.total / total) * 100) : 0;
            const delta = row.total - (before[row.category] ?? 0);
            return (
              <li key={row.category}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium">{meta.label}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatINR(row.total)}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(3, share)}%` }}
                    role="progressbar"
                    aria-valuenow={share}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${meta.label} share of this month`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {share}% of the month
                  {before[row.category] > 0
                    ? ` · ${delta >= 0 ? "up" : "down"} ${formatINR(Math.abs(delta))} on last month`
                    : " · new this month"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}