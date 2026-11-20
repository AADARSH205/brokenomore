import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryMeta } from "@/lib/categories";
import { categoryTotalsList } from "@/lib/finance";
import { formatINR } from "@/lib/money";

export default function CategoryDonut({ expenses = [], title = "Where your money went" }) {
  const rows = categoryTotalsList(expenses);
  const total = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-sm text-muted-foreground">{formatINR(total)}</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No expenses recorded yet. Add your first one and the split appears here.
        </p>
      ) : (
        <div className="mt-4 grid items-center gap-4 sm:grid-cols-[minmax(0,180px)_1fr]">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows.map((row) => ({
                    name: categoryMeta(row.category).label,
                    value: row.total,
                    color: categoryMeta(row.category).color,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {rows.map((row) => (
                    <Cell key={row.category} fill={categoryMeta(row.category).color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatINR(value)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-2">
            {rows.slice(0, 6).map((row) => {
              const meta = categoryMeta(row.category);
              const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
              return (
                <li key={row.category} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate text-muted-foreground">{meta.label}</span>
                  <span className="tabular-nums">{formatINR(row.total)}</span>
                  <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}