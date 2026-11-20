import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveExpense } from "@/lib/finance-fns";
import { CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import { todayKey } from "@/lib/finance";

const BLANK = {
  amount: "",
  category: "food",
  date: todayKey(),
  description: "",
  payment_method: "upi",
  is_recurring: false,
  is_planned: false,
};

export default function ExpenseDialog({ open, onOpenChange, expense, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = useServerFn(saveExpense);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      expense
        ? {
            amount: String(expense.amount ?? ""),
            category: expense.category ?? "food",
            date: expense.date ?? todayKey(),
            description: expense.description ?? "",
            payment_method: expense.payment_method ?? "upi",
            is_recurring: Boolean(expense.is_recurring),
            is_planned: Boolean(expense.is_planned),
          }
        : BLANK,
    );
  }, [open, expense]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const value = Number(form.amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setError("Pick a date for this expense.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await save({
        data: {
          id: expense?.id,
          amount: value,
          category: form.category,
          date: form.date,
          description: form.description.trim(),
          payment_method: form.payment_method,
          is_recurring: form.is_recurring,
          is_planned: form.is_planned,
        },
      });
      toast.success(expense ? "Expense updated" : "Expense added");
      onOpenChange(false);
      onSaved?.();
    } catch (submitError) {
      setError(submitError?.message || "That did not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit expense" : "Add an expense"}</DialogTitle>
          <DialogDescription>
            Every entry here changes today's safe-to-spend number straight away.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="expense-amount" className="text-sm font-medium">
              Amount (₹)
            </label>
            <input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.amount}
              onChange={(event) => set("amount", event.target.value)}
              placeholder="450"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="expense-category"
                value={form.category}
                onChange={(event) => set("category", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-2 text-sm"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="expense-date" className="text-sm font-medium">
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(event) => set("date", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="expense-description" className="text-sm font-medium">
              What was it for? <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="expense-description"
              type="text"
              maxLength={120}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Groceries at the local market"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="expense-method" className="text-sm font-medium">
              Paid with
            </label>
            <select
              id="expense-method"
              value={form.payment_method}
              onChange={(event) => set("payment_method", event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-2 text-sm"
            >
              {PAYMENT_METHODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={(event) => set("is_recurring", event.target.checked)}
                className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
              />
              This repeats every month
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.is_planned}
                onChange={(event) => set("is_planned", event.target.checked)}
                className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
              />
              This is planned, not spent yet
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {expense ? "Save changes" : "Add expense"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}