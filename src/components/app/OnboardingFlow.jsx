import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  HelpCircle,
  Laptop,
  Loader2,
  Palmtree,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { saveBill, saveGoal, saveProfile } from "@/lib/finance-fns";
import { computeDailyNumber, formatINR } from "@/lib/money";

const GOAL_OPTIONS = [
  { key: "emergency", label: "Emergency Fund", icon: Shield, defaultAmount: 50000, desc: "3-6 months living expenses" },
  { key: "sip", label: "First SIP / Wealth", icon: TrendingUp, defaultAmount: 100000, desc: "Long-term index fund compounding" },
  { key: "laptop", label: "Tech / Laptop", icon: Laptop, defaultAmount: 70000, desc: "Work machine or setup upgrade" },
  { key: "vacation", label: "Trip / Vacation", icon: Palmtree, defaultAmount: 35000, desc: "Recharge without debt" },
];

export default function OnboardingFlow({ onCompleted }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Salary date & In-hand salary
  const [displayName, setDisplayName] = useState("");
  const [salaryDay, setSalaryDay] = useState("1");
  const [monthlyIncome, setMonthlyIncome] = useState("45000");

  // Step 2: Fixed bills
  const [rentAmount, setRentAmount] = useState("12000");
  const [wifiAmount, setWifiAmount] = useState("1000");
  const [otherBillsAmount, setOtherBillsAmount] = useState("");

  // Step 3: Savings goal
  const [selectedGoal, setSelectedGoal] = useState("emergency");
  const [savingsTarget, setSavingsTarget] = useState("6000");

  // Step 4: Daily reminder toggle
  const [dailyReminder, setDailyReminder] = useState(true);

  const saveProfileFn = useServerFn(saveProfile);
  const saveBillFn = useServerFn(saveBill);
  const saveGoalFn = useServerFn(saveGoal);

  // Calculations
  const incomeNum = Math.max(0, Number(monthlyIncome) || 0);
  const totalBillsNum =
    (Number(rentAmount) || 0) + (Number(wifiAmount) || 0) + (Number(otherBillsAmount) || 0);
  const savingsNum = Math.max(0, Number(savingsTarget) || 0);

  // Remaining days in month approximation for first day
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const salDayNum = Number(salaryDay) || 1;
  const daysLeft = salDayNum > dayOfMonth ? salDayNum - dayOfMonth : daysInMonth - dayOfMonth + salDayNum;

  const preview = computeDailyNumber({
    salary: incomeNum,
    bills: totalBillsNum,
    savings: savingsNum,
    days: Math.max(1, daysLeft),
  });

  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Save profile
      await saveProfileFn({
        data: {
          display_name: displayName.trim(),
          monthly_income: incomeNum,
          extra_income: 0,
          salary_day: salDayNum,
          monthly_savings_target: savingsNum,
          safety_buffer: 1000,
        },
      });

      // 2. Save bills if entered
      if (Number(rentAmount) > 0) {
        await saveBillFn({
          data: {
            name: "House Rent",
            amount: Number(rentAmount),
            category: "housing",
            due_day: Math.min(5, salDayNum + 2),
            is_essential: true,
            active: true,
          },
        }).catch(() => null);
      }
      if (Number(wifiAmount) > 0) {
        await saveBillFn({
          data: {
            name: "WiFi & Utilities",
            amount: Number(wifiAmount),
            category: "utilities",
            due_day: Math.min(10, salDayNum + 5),
            is_essential: true,
            active: true,
          },
        }).catch(() => null);
      }
      if (Number(otherBillsAmount) > 0) {
        await saveBillFn({
          data: {
            name: "Subscriptions & EMIs",
            amount: Number(otherBillsAmount),
            category: "bills",
            due_day: Math.min(15, salDayNum + 7),
            is_essential: true,
            active: true,
          },
        }).catch(() => null);
      }

      // 3. Save initial savings goal
      const goalConfig = GOAL_OPTIONS.find((g) => g.key === selectedGoal) || GOAL_OPTIONS[0];
      await saveGoalFn({
        data: {
          name: goalConfig.label,
          kind: goalConfig.key === "sip" ? "other" : goalConfig.key,
          target_amount: goalConfig.defaultAmount,
          saved_amount: 0,
        },
      }).catch(() => null);

      if (dailyReminder) {
        if (typeof window !== "undefined") {
          localStorage.setItem("brokenomore_daily_reminder", "true");
        }
      }

      toast.success("Welcome to BrokeNoMore! Your plan is live.");
      onCompleted?.();
    } catch (err) {
      toast.error(err?.message || "Failed to save setup. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      {/* STEP INDICATOR (4 SCREENS MAX) */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                    ? "w-4 bg-primary/50"
                    : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Screen {step} of 4
        </span>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {/* ================= SCREEN 1: SALARY DATE & IN-HAND AMOUNT ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Step 1 · Payday & Salary
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                When do you get paid, and how much?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Enter what actually lands in your bank account after PF and TDS deductions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="ob-name" className="text-sm font-medium">
                  What should we call you? <span className="text-xs text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="ob-name"
                  type="text"
                  placeholder="e.g. Aarav"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="ob-salary" className="text-sm font-medium">
                  Monthly in-hand salary (₹)
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <input
                    id="ob-salary"
                    type="number"
                    inputMode="numeric"
                    step="500"
                    min="5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="45000"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your take-home cash, not the CTC number on your offer letter.
                </p>
              </div>

              <div>
                <label htmlFor="ob-salary-day" className="text-sm font-medium">
                  Salary credit date of the month
                </label>
                <div className="relative mt-1.5 max-w-[140px]">
                  <input
                    id="ob-salary-day"
                    type="number"
                    min="1"
                    max="31"
                    value={salaryDay}
                    onChange={(e) => setSalaryDay(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold tabular-nums"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    th of month
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={incomeNum <= 0}
              onClick={() => setStep(2)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              Next: Fixed Bills
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ================= SCREEN 2: FIXED BILLS ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                Step 2 · Fixed Commitments
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                What bills must be paid every month?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                We ring-fence these funds on salary day so you never risk missing rent or electricity.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="ob-rent" className="text-sm font-medium">
                  House Rent / PG (₹)
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <input
                    id="ob-rent"
                    type="number"
                    inputMode="numeric"
                    step="500"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    placeholder="12000"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ob-wifi" className="text-sm font-medium">
                  WiFi, Mobile & Utilities (₹)
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <input
                    id="ob-wifi"
                    type="number"
                    inputMode="numeric"
                    step="100"
                    value={wifiAmount}
                    onChange={(e) => setWifiAmount(e.target.value)}
                    placeholder="1000"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ob-other-bills" className="text-sm font-medium">
                  Other EMIs / Subscriptions (₹) <span className="text-xs text-muted-foreground">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <input
                    id="ob-other-bills"
                    type="number"
                    inputMode="numeric"
                    step="500"
                    value={otherBillsAmount}
                    onChange={(e) => setOtherBillsAmount(e.target.value)}
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-3.5 text-xs text-muted-foreground flex justify-between items-center">
                <span>Total monthly bills to hold back:</span>
                <strong className="text-sm text-foreground">{formatINR(totalBillsNum)}</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Next: Savings Goal
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: SAVINGS GOAL ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Step 3 · Your First Goal
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                What are you setting money aside for?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Pay yourself first. Even 15% of your income kept safe builds independence.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {GOAL_OPTIONS.map((g) => {
                const Icon = g.icon;
                const active = selectedGoal === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setSelectedGoal(g.key)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="rounded-xl bg-secondary p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{g.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="ob-savings-target" className="text-sm font-medium">
                How much to set aside each month? (₹)
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <input
                  id="ob-savings-target"
                  type="number"
                  inputMode="numeric"
                  step="500"
                  min="500"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                  placeholder="6000"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm font-semibold tabular-nums"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Recommended: ₹{Math.round(incomeNum * 0.15)} (15% of your in-hand).
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Reveal My Daily Number
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 4: REVEAL SAFE-TO-SPEND NUMBER ================= */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-positive-soft">
              <Sparkles className="h-7 w-7 text-positive" />
            </div>

            <div>
              <span className="rounded-full bg-positive-soft px-3 py-1 text-xs font-semibold text-positive uppercase tracking-wider">
                Your first safe-to-spend number
              </span>
              <div className="mt-4">
                <p className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                  {formatINR(preview.daily)}
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  safe to spend today, guilt-free
                </p>
              </div>
            </div>

            {/* BREAKDOWN PILL */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
              <div className="grid grid-cols-3 gap-2 divide-x divide-border">
                <div>
                  <p className="text-[11px] uppercase tracking-wider">Income</p>
                  <p className="mt-1 font-semibold text-foreground text-sm">{formatINR(incomeNum)}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider">Bills & Savings</p>
                  <p className="mt-1 font-semibold text-foreground text-sm">
                    -{formatINR(totalBillsNum + savingsNum)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider">Spendable</p>
                  <p className="mt-1 font-semibold text-positive text-sm">{formatINR(preview.free)}</p>
                </div>
              </div>
            </div>

            {/* DAILY REMINDER OPTION */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Daily Morning Reminder</p>
                  <p className="text-xs text-muted-foreground">
                    Get today's safe-to-spend number every morning at 9:00 AM.
                  </p>
                </div>
              </div>
              <Switch
                id="daily-reminder-toggle"
                checked={dailyReminder}
                onCheckedChange={setDailyReminder}
              />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleFinish}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up your plan...
                </>
              ) : (
                <>
                  Take me to my dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
