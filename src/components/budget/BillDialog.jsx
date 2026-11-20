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
import { saveBill } from "@/lib/finance-fns";
import { CATEGORIES } from "@/lib/categories";

const BLANK = { name: "", amount: "", category: "bills", due_day: "5", is_essential: true };

export default function BillDialog({ open, onOpenChange, bill, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = useServerFn(saveBill);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      bill
        ? {
            name: bill.name ?? "",
            amount: String(bill.amount ?? ""),
            category: bill.category ?? "bills",
            due_day: String(bill.due_day ?? 5),
            is_essential: bill.is_essential !== false,
          }
        : BLANK,
    );
  }, [open, bill]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    const dueDay = Number(form.due_day);
    if (!form.name.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Give the bill a name and an amount above zero.");
      return;
    }
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      setError("The due day must be between 1 and 31.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await save({
        data: {
          id: bill?.id,
          name: form.name.trim(),
          amount,
          category: form.category,
          due_day: dueDay,
          is_essential: form.is_essential,
        },
      });
      toast.success(bill ? "Bill updated" : "Bill added");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit bill" : "Add a recurring bill"}</DialogTitle>
          <DialogDescription>
            Unpaid essential bills are held back from your daily number, so you never spend rent money.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="bill-name" className="text-sm font-medium">
              Bill name
            </label>
            <input
              id="bill-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              maxLength={60}
              placeholder="House rent"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bill-amount" className="text-sm font-medium">
                Amount (₹)
              </label>
              <input
                id="bill-amount"
                type="number"
                min="1"
                step="1"
                value={form.amount}
                onChange={(event) => set("amount", event.target.value)}
                placeholder="12000"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="bill-day" className="text-sm font-medium">
                Due day
              </label>
              <input
                id="bill-day"
                type="number"
                min="1"
                max="31"
                value={form.due_day}
                onChange={(event) => set("due_day", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bill-category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="bill-category"
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

          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.is_essential}
              onChange={(event) => set("is_essential", event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
            />
            <span>
              Essential
              <span className="block text-xs text-muted-foreground">
                Essential bills are subtracted before your safe-to-spend amount.
              </span>
            </span>
          </label>

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
              {bill ? "Save changes" : "Add bill"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}