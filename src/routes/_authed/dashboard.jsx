import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Plus, TrendingUp, Wallet } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import SafeToSpendCard from "@/components/app/SafeToSpendCard";
import InsightList from "@/components/app/InsightList";
import CategoryDonut from "@/components/app/CategoryDonut";
import UpcomingBills from "@/components/app/UpcomingBills";
import BudgetProgress from "@/components/app/BudgetProgress";
import SetupForm from "@/components/app/SetupForm";
import ExpenseDialog from "@/components/expenses/ExpenseDialog";
import useFinanceData from "@/hooks/useFinanceData";
import { buildInsights, expensesInCycle, expensesInMonth, goalProgress, safeToSpend, salaryCycle, sipTotals, sumExpenses, todayKey } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { formatDay } from "@/lib/format";
import { monthLabel } from "@/lib/finance";

export const Route = createFileRoute("/_authed/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — BrokeNoMore" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile, expenses, budgets, bills, payments, goals, sips, loading, error, reload, month, prevMonth } =
    useFinanceData();
  const [expenseOpen, setExpenseOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-full bg-secondary" />
        <div className="h-48 animate-pulse rounded-3xl bg-secondary" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-28 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-medium">We could not load your money data.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Your dashboard"
          title="Let's set up your plan"
          description="One salary number, one savings number, and the day you get paid. Everything else builds from there."
        />
        <SetupForm profile={null} onSaved={reload} />
      </div>
    );
  }

  const today = todayKey();
  const cycle = salaryCycle(new Date(), profile.salary_day ?? 1);
  const cycleExpenses = expensesInCycle(expenses, cycle);
  const spent = sumExpenses(cycleExpenses);
  const income = Number(profile.monthly_income) || 0;
  const extra = Number(profile.extra_income) || 0;
  const paidIds = new Set(payments.map((payment) => payment.bill_id));
  const unpaidBills = bills
    .filter((bill) => bill.is_essential !== false && !paidIds.has(bill.id))
    .reduce((total, bill) => total + (Number(bill.amount) || 0), 0);

  const result = safeToSpend({
    income,
    extraIncome: extra,
    savingsTarget: profile.monthly_savings_target,
    safetyBuffer: profile.safety_buffer,
    unpaidBills,
    spent,
    daysLeft: cycle.daysLeft,
  });

  const insights = buildInsights({
    profile,
    cycle,
    expenses,
    prevExpenses: expensesInMonth(expenses, prevMonth),
    budgets,
    bills,
    payments,
    goals,
    sips,
    today,
  });

  const sip = sipTotals(sips);
  const savingsThisCycle = income + extra - spent;
  const spentPct = income > 0 ? Math.round((spent / income) * 100) : 0;
  const goalRows = goals
    .map((goal) => ({ goal, progress: goalProgress(goal, today) }))
    .sort((a, b) => b.progress.pct - a.progress.pct)
    .slice(0, 2);
  const monthExpenses = expensesInMonth(expenses, month);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={monthLabel(cycle.monthKey)}
        title={`Hi${profile.display_name ? ` ${profile.display_name}` : ""}, here is today`}
        description={`Your salary cycle runs from ${formatDay(cycle.startKey, { year: undefined })} to ${formatDay(cycle.endKey, { year: undefined })}. Every number below comes from what you have recorded.`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setExpenseOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add expense
            </button>
            <Link
              to="/budget"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium"
            >
              <Wallet className="h-4 w-4" aria-hidden="true" />
              Budget
            </Link>
          </>
        }
      />

      <SafeToSpendCard result={result} daysLeft={cycle.daysLeft} nextSalaryKey={cycle.endKey} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Take-home this month" value={formatINR(income + extra)} hint={`${formatINR(extra)} of it is other income`} />
        <StatCard
          label="Spent this cycle"
          value={formatINR(spent)}
          hint={`${spentPct}% of your take-home`}
          tone={spentPct >= 90 ? "bad" : spentPct >= 70 ? "warn" : "default"}
        />
        <StatCard
          label="Savings this cycle"
          value={formatINR(Number(profile.monthly_savings_target) || 0)}
          hint={
            savingsThisCycle < 0
              ? "You have spent more than came in"
              : `${formatINR(Math.max(0, savingsThisCycle))} still unspent`
          }
          tone={savingsThisCycle < 0 ? "bad" : savingsThisCycle >= (Number(profile.monthly_savings_target) || 0) ? "good" : "warn"}
        />
        <StatCard
          label="Active SIPs"
          value={`${formatINR(sip.monthly)}/mo`}
          hint={`${sip.activeCount} running${sip.pausedCount ? `, ${sip.pausedCount} paused` : ""}`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <CategoryDonut expenses={cycleExpenses} title="This cycle by category" />
        <InsightList insights={insights} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-semibold tracking-tight">Bills to pay</h2>
            <Link to="/budget" className="text-xs font-medium text-muted-foreground underline underline-offset-2">
              Manage
            </Link>
          </div>
          <div className="mt-2">
            <UpcomingBills bills={bills} payments={payments} month={month} onChanged={reload} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold tracking-tight">Next salary</h2>
            <p className="mt-2 font-display text-2xl font-semibold">{formatDay(cycle.endKey)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {cycle.daysLeft} day{cycle.daysLeft === 1 ? "" : "s"} away
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Salary lands on the {profile.salary_day}th
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold tracking-tight">Goals</h2>
              <Link to="/goals" className="text-xs font-medium text-muted-foreground underline underline-offset-2">
                All goals
              </Link>
            </div>
            {goalRows.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No goals yet. An emergency fund is the best first one.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {goalRows.map(({ goal, progress }) => (
                  <li key={goal.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate">{goal.name}</span>
                      <span className="tabular-nums text-muted-foreground">{progress.pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-positive" style={{ width: `${progress.pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">Budget this month</h2>
          <Link to="/budget" className="text-xs font-medium text-muted-foreground underline underline-offset-2">
            Edit limits
          </Link>
        </div>
        <div className="mt-4">
          <BudgetProgress budgets={budgets} expenses={monthExpenses} />
        </div>
      </div>

      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} onSaved={reload} />
    </div>
  );
}