import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Plus, Receipt, Search } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import EmptyState from "@/components/app/EmptyState";
import ConfirmDialog from "@/components/app/ConfirmDialog";
import ExpenseDialog from "@/components/expenses/ExpenseDialog";
import ExpenseRow from "@/components/expenses/ExpenseRow";
import WeeklyBars from "@/components/expenses/WeeklyBars";
import MonthlyBars from "@/components/expenses/MonthlyBars";
import TopCategories from "@/components/expenses/TopCategories";
import CategoryDonut from "@/components/app/CategoryDonut";
import useFinanceData from "@/hooks/useFinanceData";
import { deleteExpense } from "@/lib/finance-fns";
import {
  addMonths,
  dailyTotals,
  expensesInMonth,
  largestExpenses,
  monthKeyOf,
  monthLabel,
  monthlyTotals,
  sumExpenses,
} from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { formatDay, weekdayName } from "@/lib/format";
import { CATEGORIES, categoryMeta } from "@/lib/categories";

export const Route = createFileRoute("/_authed/expenses")({
  ssr: false,
  head: () => ({ meta: [{ title: "Expenses — BrokeNoMore" }] }),
  component: ExpensesPage,
});

const THIS_MONTH = monthKeyOf(new Date());

function ExpensesPage() {
  const [month, setMonth] = useState(THIS_MONTH);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dialog, setDialog] = useState({ open: false, expense: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  const { expenses, loading, error, reload, prevMonth } = useFinanceData(month, ["expenses"]);
  const remove = useServerFn(deleteExpense);

  const monthExpenses = useMemo(() => expensesInMonth(expenses, month), [expenses, month]);
  const prevExpenses = useMemo(() => expensesInMonth(expenses, prevMonth), [expenses, prevMonth]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return monthExpenses.filter((expense) => {
      if (category !== "all" && expense.category !== category) return false;
      if (!term) return true;
      const label = categoryMeta(expense.category).label.toLowerCase();
      return `${expense.description ?? ""} ${label}`.toLowerCase().includes(term);
    });
  }, [monthExpenses, search, category]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const expense of filtered) {
      const key = expense.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(expense);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const total = sumExpenses(monthExpenses);
  const previousTotal = sumExpenses(prevExpenses);
  const delta = total - previousTotal;
  const biggest = largestExpenses(monthExpenses, 1)[0];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove({ data: { id: pendingDelete.id } });
      toast.success("Expense deleted");
      setPendingDelete(null);
      reload();
    } catch (deleteError) {
      toast.error(deleteError?.message || "That did not delete. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expenses"
        title="Every rupee, accounted for"
        description="Record what you spend as it happens. The dashboard number follows automatically."
        actions={
          <button
            type="button"
            onClick={() => setDialog({ open: true, expense: null })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add expense
          </button>
        }
      />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
        <button
          type="button"
          onClick={() => setMonth((current) => addMonths(current, -1))}
          aria-label="Previous month"
          className="rounded-full p-2 hover:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-sm font-medium">{monthLabel(month)}</p>
        <button
          type="button"
          onClick={() => setMonth((current) => addMonths(current, 1))}
          disabled={month >= THIS_MONTH}
          aria-label="Next month"
          className="rounded-full p-2 hover:bg-secondary disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-medium">We could not load your expenses.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Spent this month" value={formatINR(total)} hint={`${monthExpenses.length} entries`} />
            <StatCard
              label="Against last month"
              value={`${delta > 0 ? "+" : ""}${formatINR(delta)}`}
              hint={
                previousTotal > 0
                  ? `${total >= previousTotal ? "Up" : "Down"} ${Math.abs(Math.round((delta / previousTotal) * 100))}% from ${formatINR(previousTotal)}`
                  : "No spending recorded last month"
              }
              tone={delta > 0 ? "warn" : delta < 0 ? "good" : "default"}
            />
            <StatCard
              label="Largest expense"
              value={biggest ? formatINR(Number(biggest.amount) || 0) : "—"}
              hint={biggest ? biggest.description || categoryMeta(biggest.category).label : "Nothing recorded yet"}
            />
            <StatCard
              label="Average per entry"
              value={formatINR(monthExpenses.length ? Math.round(total / monthExpenses.length) : 0)}
              hint="Useful when a habit creeps up"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryDonut expenses={monthExpenses} title={`${monthLabel(month)} by category`} />
            <TopCategories expenses={monthExpenses} previous={prevExpenses} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <WeeklyBars data={dailyTotals(expenses, 7)} />
            <MonthlyBars data={monthlyTotals(expenses, 6)} />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight">History</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search expenses"
                    aria-label="Search expenses"
                    className="h-9 w-full rounded-full border border-input bg-background pl-8 pr-3 text-sm sm:w-48"
                  />
                </div>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Filter by category"
                  className="h-9 rounded-full border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All categories</option>
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-12 animate-pulse rounded-xl bg-secondary" />
                  ))}
                </div>
              ) : grouped.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title={monthExpenses.length === 0 ? "Nothing recorded this month" : "No matches"}
                  body={
                    monthExpenses.length === 0
                      ? "Add your first expense and your safe-to-spend number updates immediately."
                      : "Try a different search term or category."
                  }
                  action={
                    monthExpenses.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setDialog({ open: true, expense: null })}
                        className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                      >
                        Add expense
                      </button>
                    ) : null
                  }
                />
              ) : (
                <div className="space-y-5">
                  {grouped.map(([date, rows]) => (
                    <div key={date}>
                      <div className="flex items-baseline justify-between border-b border-border pb-1.5">
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                          {weekdayName(date)}, {formatDay(date, { year: undefined })}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">{formatINR(sumExpenses(rows))}</p>
                      </div>
                      <ul className="divide-y divide-border/60">
                        {rows.map((expense) => (
                          <ExpenseRow
                            key={expense.id}
                            expense={expense}
                            onEdit={(item) => setDialog({ open: true, expense: item })}
                            onDelete={(item) => setPendingDelete(item)}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ExpenseDialog
        open={dialog.open}
        expense={dialog.expense}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSaved={reload}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this expense?"
        description={
          pendingDelete
            ? `${formatINR(Number(pendingDelete.amount) || 0)} for ${pendingDelete.description || categoryMeta(pendingDelete.category).label} will be removed and your daily number recalculated.`
            : ""
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}