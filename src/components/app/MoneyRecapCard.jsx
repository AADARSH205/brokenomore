import { useMemo } from "react";
import { ArrowUpRight, CheckCircle2, ChevronRight, HelpCircle, Lightbulb, PieChart, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { formatINR } from "@/lib/money";

export default function MoneyRecapCard({
  profile,
  cycle,
  expenses = [],
  budgets = [],
  bills = [],
  goals = [],
  sips = [],
}) {
  const income = Number(profile?.monthly_income) || 0;
  const extra = Number(profile?.extra_income) || 0;
  const totalIncome = income + extra;

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const totalBudget = useMemo(() => {
    const fromBudgets = budgets.reduce((sum, b) => sum + (Number(b.allocated) || 0), 0);
    return fromBudgets > 0 ? fromBudgets : totalIncome;
  }, [budgets, totalIncome]);

  const spentPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const unspent = Math.max(0, totalIncome - totalSpent);
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((unspent / totalIncome) * 100)) : 0;

  // Category breakdown for smart suggestion
  const { topCategory, topAmount } = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const cat = e.category || "other";
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0);
    }
    let maxCat = null;
    let maxAmt = 0;
    for (const [k, v] of Object.entries(map)) {
      if (v > maxAmt) {
        maxAmt = v;
        maxCat = k;
      }
    }
    return { topCategory: maxCat, topAmount: maxAmt };
  }, [expenses]);

  // Generate one specific actionable suggestion
  const suggestion = useMemo(() => {
    const activeSips = sips.filter((s) => s.status !== "paused");
    const emergencyGoal = goals.find((g) => g.kind === "emergency");
    const emergencySaved = Number(emergencyGoal?.saved_amount) || 0;
    const estimatedMonthlyExpenses = totalIncome * 0.6;

    if (totalIncome <= 0) {
      return {
        title: "Log your income",
        body: "Set your monthly in-hand salary in Settings so your recap gives you exact percentages.",
        tone: "neutral",
      };
    }

    if (totalSpent > totalBudget && cycle?.daysLeft > 0) {
      return {
        title: "Pause non-essential spending",
        body: `You are ₹${formatINR(totalSpent - totalBudget).replace("₹", "")} over budget with ${cycle.daysLeft} days remaining. Rely on pantry meals and free entertainment until payday.`,
        tone: "warn",
      };
    }

    if (savingsRate >= 25 && activeSips.length === 0) {
      return {
        title: "You have room to start your first SIP",
        body: `Your savings rate is strong at ${savingsRate}%. Starting a modest ₹1,000/month Nifty 50 index fund SIP will put your unspent cash to work compounding.`,
        tone: "positive",
      };
    }

    if (emergencySaved < estimatedMonthlyExpenses * 3 && unspent > 3000) {
      return {
        title: "Boost your emergency shield",
        body: `You saved ${formatINR(unspent)} this cycle. Move ₹${formatINR(Math.min(5000, unspent)).replace("₹", "")} into your emergency fund to build a 3-month safety net.`,
        tone: "positive",
      };
    }

    if (topCategory && topAmount > totalIncome * 0.35) {
      const catName = topCategory.charAt(0).toUpperCase() + topCategory.slice(1);
      return {
        title: `${catName} is your largest spend (${formatINR(topAmount)})`,
        body: `${catName} took up ${Math.round((topAmount / totalIncome) * 100)}% of your take-home. Trimming this by just 10% unlocks an extra ₹${formatINR(Math.round(topAmount * 0.1)).replace("₹", "")} every month.`,
        tone: "neutral",
      };
    }

    return {
      title: "Consistent money discipline",
      body: `You have ${formatINR(unspent)} unspent and your savings rate is ${savingsRate}%. Keep logging expenses via UPI as they occur to protect your daily allowance.`,
      tone: "positive",
    };
  }, [totalIncome, totalSpent, totalBudget, cycle?.daysLeft, savingsRate, sips, goals, unspent, topCategory, topAmount]);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Monthly Money Recap
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Salary cycle review
          </span>
        </div>
        <span className="text-xs font-semibold text-primary">
          Savings rate: {savingsRate}%
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* SPENT VS BUDGET */}
        <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-muted-foreground uppercase tracking-wider">
              Spent vs Budget
            </span>
            <span className="font-semibold text-foreground">
              {formatINR(totalSpent)} / {formatINR(totalBudget)}
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPct >= 95
                  ? "bg-destructive"
                  : spentPct >= 75
                    ? "bg-amber-500"
                    : "bg-positive"
              }`}
              style={{ width: `${Math.min(100, Math.max(5, spentPct))}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{spentPct}% utilized</span>
            <span>{formatINR(Math.max(0, totalBudget - totalSpent))} buffer remaining</span>
          </div>
        </div>

        {/* SAVINGS RATE */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-background p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground uppercase tracking-wider">
              Cycle Savings Rate
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-positive-soft px-2.5 py-0.5 text-xs font-semibold text-positive">
              <TrendingUp className="h-3 w-3" />
              {savingsRate}%
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold tracking-tight text-foreground">
              {formatINR(unspent)}
            </p>
            <span className="text-xs text-muted-foreground">retained</span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {savingsRate >= 20
              ? "Healthy cushion above the recommended 20% rule."
              : "Try aiming for at least 15–20% retained each cycle."}
          </p>
        </div>
      </div>

      {/* ONE SPECIFIC SUGGESTION */}
      <div
        className={`mt-5 flex items-start gap-3 rounded-2xl border p-4.5 ${
          suggestion.tone === "warn"
            ? "border-amber-500/30 bg-amber-500/10"
            : suggestion.tone === "positive"
              ? "border-positive/30 bg-positive-soft/25"
              : "border-border bg-secondary/40"
        }`}
      >
        <div className="rounded-xl bg-card p-2 text-primary shadow-xs">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Actionable Insight For You
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {suggestion.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {suggestion.body}
          </p>
        </div>
      </div>
    </div>
  );
}
