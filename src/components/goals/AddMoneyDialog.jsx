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
import { addToGoal } from "@/lib/finance-fns";
import { formatINR } from "@/lib/money";
import { goalProgress } from "@/lib/finance";

export default function AddMoneyDialog({ open, onOpenChange, goal, onSaved }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const add = useServerFn(addToGoal);
  const progress = goal ? goalProgress(goal) : null;

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setError("");
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount above zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await add({ data: { id: goal.id, amount: value } });
      toast.success(`${formatINR(value)} added to ${goal.name}`);
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to {goal?.name}</DialogTitle>
          <DialogDescription>
            {progress
              ? `${formatINR(progress.saved)} saved of ${formatINR(progress.target)}. ${formatINR(progress.remaining)} to go.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="goal-amount" className="text-sm font-medium">
              Amount (₹)
            </label>
            <input
              id="goal-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="2000"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              required
            />
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
              Add money
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}