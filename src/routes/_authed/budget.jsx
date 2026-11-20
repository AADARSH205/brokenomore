import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import ConfirmDialog from "@/components/app/ConfirmDialog";
import BudgetEditor from "@/components/budget/BudgetEditor";
import BillDialog from "@/components/budget/BillDialog";
import UpcomingBills from "@/components/app/UpcomingBills";
import useFinanceData from "@/hooks/useFinanceData";
import { deleteBill } from "@/lib/finance-fns";
import { addMonths, expensesInMonth, monthKeyOf, monthLabel, sumExpenses } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { categoryMeta } from "@/lib/categories";
import { ordinal } from "@/lib/format";

export const Route = createFileRoute("/_authed/budget")({
  ssr: false,
  head: () => ({ meta: [{ title: "Budget planner — BrokeNoMore" }] }),
  component: BudgetPage,
});

const THIS_MONTH = monthKeyOf(new Date());

function BudgetPage() {
  const [month, setMonth] = useState(THIS_MONTH);
  const { profile, expenses, budgets, bills, payments, loading, error, reload } = useFinanceData(month, [
    "profile",
    "expenses",
    "budgets",
    "bills",
    "payments",
  ]);
  const [billDialog, setBillDialog] = useState({ open: false, bill: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const removeBill = useServerFn(deleteBill);

  const monthExpenses = useMemo(() => expensesInMonth(expenses, month), [expenses, month]);
  const totalSpent = sumExpenses(monthExpenses);
  const budgeted = budgets.reduce((sum, budget) => sum + (Number(budget.limit_amount) || 0), 0);
  const spentInBudgeted = monthExpenses
    .filter((expense) => budgets.some((budget) => budget.category === expense.category))
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const unpaidBills = bills
    .filter((bill) => bill.is_essential !== false && !payments.some((payment) => payment.bill_id === bill.id))
    .reduce((sum, bill) => sum + (Number(bill.amount) || 0), 0);

  const tips = useMemo(() => {
    const list = [];
    const overs = budgets
      .map((budget) => ({
        budget,
        spent: monthExpenses
          .filter((expense) => expense.category === budget.category)
          .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
      }))
      .filter((row) => row.spent > Number(row.budget.limit_amount))
      .sort((a, b) => b.spent - b.budget.limit_amount - (a.spent - a.budget.limit_amount));

    if (overs.length > 0) {
      const top = overs[0];
      const meta = categoryMeta(top.budget.category);
      list.push(
        `${meta.label} is over its limit by ${formatINR(top.spent - Number(top.budget.limit_amount))}. Either raise the limit to ${formatINR(top.spent)} so it is honest, or move that spend to next month.`,
      );
    }

    if (totalSpent > 0 && monthExpenses.length > 0) {
      const avg = Math.round(totalSpent / monthExpenses.length);
      list.push(
        `Your average entry is ${formatINR(avg)}. Cutting one ${formatINR(avg)} spend a week saves about ${formatINR(avg * 4)} a month.`,
      );
    }

    const savings = Number(profile?.monthly_savings_target) || 0;
    const income = Number(profile?.monthly_income) || 0;
    if (income > 0 && savings > 0 && budgeted > income - savings) {
      list.push(
        `Your limits add up to ${formatINR(budgeted)}, which is more than the ${formatINR(income - savings)} left after savings. Trim the difference or your savings goal will slip.`,
      );
    }

    if (budgets.length === 0) {
      list.push(
        "Start with three limits: food, transport and shopping. Those are the three that move the most month to month.",
      );
    }

    return list.slice(0, 3);
  }, [budgets, monthExpenses, totalSpent, profile]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await removeBill({ data: { id: pendingDelete.id } });
      toast.success("Bill removed");
      setPendingDelete(null);
      reload();
    } catch (deleteError) {
      toast.error(deleteError?.message || "That did not delete. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Budget planner"
        title="Give every category a ceiling"
        description="A limit is a decision made once, on a calm day, instead of every evening at checkout."
        actions={
          <button
            type="button"
            onClick={() => setBillDialog({ open: true, bill: null })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add bill
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
          <p className="font-medium">We could not load your budget.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Budgeted" value={formatINR(budgeted)} hint={`${budgets.length} categories`} icon={Wallet} />
            <StatCard
              label="Spent against limits"
              value={formatINR(spentInBudgeted)}
              hint={budgeted > 0 ? `${Math.round((spentInBudgeted / budgeted) * 100)}% of your limits used` : "No limits set yet"}
              tone={budgeted > 0 && spentInBudgeted > budgeted ? "bad" : "default"}
            />
            <StatCard
              label="Spending outside limits"
              value={formatINR(Math.max(0, totalSpent - spentInBudgeted))}
              hint="Categories without a ceiling"
            />
            <StatCard
              label="Unpaid essential bills"
              value={formatINR(unpaidBills)}
              hint="Already held back from today's number"
              tone={unpaidBills > 0 ? "warn" : "good"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <BudgetEditor month={month} budgets={budgets} expenses={monthExpenses} onSaved={reload} />

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h2 className="font-display text-lg font-semibold tracking-tight">Recurring bills</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mark one paid and it becomes an expense, so it is never counted twice.
                </p>
                <div className="mt-3">
                  <UpcomingBills bills={bills} payments={payments} month={month} onChanged={reload} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h2 className="font-display text-lg font-semibold tracking-tight">Ways to free up money</h2>
                <ul className="mt-3 space-y-2.5">
                  {tips.map((tip) => (
                    <li key={tip} className="rounded-xl bg-secondary/60 px-3 py-2.5 text-[13px] leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold tracking-tight">All bills</h2>
            {loading ? (
              <div className="mt-3 h-16 animate-pulse rounded-xl bg-secondary" />
            ) : bills.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                No bills yet. Add rent, electricity, internet or your phone bill.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {bills.map((bill) => (
                  <li key={bill.id} className="flex items-center gap-3 py-3">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: categoryMeta(bill.category).color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{bill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatINR(Number(bill.amount) || 0)} · due {ordinal(bill.due_day)} ·{" "}
                        {bill.is_essential === false ? "flexible" : "essential"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBillDialog({ open: true, bill })}
                      aria-label={`Edit ${bill.name}`}
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(bill)}
                      aria-label={`Delete ${bill.name}`}
                      className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <BillDialog
        open={billDialog.open}
        bill={billDialog.bill}
        onOpenChange={(open) => setBillDialog((current) => ({ ...current, open }))}
        onSaved={reload}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this bill?"
        description={pendingDelete ? `${pendingDelete.name} will stop being held back from your daily number.` : ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
}