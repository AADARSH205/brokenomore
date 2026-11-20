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
import { saveGoal } from "@/lib/finance-fns";
import { GOAL_KINDS, GOAL_PRESETS } from "@/lib/categories";
import { todayKey } from "@/lib/finance";

const BLANK = { name: "", kind: "emergency", target_amount: "", saved_amount: "", target_date: "" };

function dateInMonths(months) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

export default function GoalDialog({ open, onOpenChange, goal, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = useServerFn(saveGoal);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      goal
        ? {
            name: goal.name ?? "",
            kind: goal.kind ?? "other",
            target_amount: String(goal.target_amount ?? ""),
            saved_amount: goal.saved_amount ? String(goal.saved_amount) : "",
            target_date: goal.target_date ?? "",
          }
        : { ...BLANK, target_date: dateInMonths(12) },
    );
  }, [open, goal]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const target = Number(form.target_amount);
    if (!form.name.trim() || !Number.isFinite(target) || target <= 0) {
      setError("Give the goal a name and a target above zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await save({
        data: {
          id: goal?.id,
          name: form.name.trim(),
          kind: form.kind,
          target_amount: target,
          saved_amount: Number(form.saved_amount) || 0,
          target_date: form.target_date || "",
        },
      });
      toast.success(goal ? "Goal updated" : "Goal created");
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
          <DialogTitle>{goal ? "Edit goal" : "New saving goal"}</DialogTitle>
          <DialogDescription>
            A goal turns a vague intention into a monthly number you can actually hit.
          </DialogDescription>
        </DialogHeader>

        {!goal && (
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                onClick={() =>
                  setForm({
                    name: preset.name,
                    kind: preset.kind,
                    target_amount: String(preset.target),
                    saved_amount: "",
                    target_date: dateInMonths(preset.months),
                  })
                }
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="goal-name" className="text-sm font-medium">
              Goal name
            </label>
            <input
              id="goal-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              maxLength={60}
              placeholder="Give this goal a name"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="goal-kind" className="text-sm font-medium">
              Type
            </label>
            <select
              id="goal-kind"
              value={form.kind}
              onChange={(event) => set("kind", event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-2 text-sm"
            >
              {GOAL_KINDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-target" className="text-sm font-medium">
                Target (₹)
              </label>
              <input
                id="goal-target"
                type="number"
                min="1"
                step="1"
                value={form.target_amount}
                onChange={(event) => set("target_amount", event.target.value)}
                placeholder="90000"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="goal-saved" className="text-sm font-medium">
                Saved so far (₹)
              </label>
              <input
                id="goal-saved"
                type="number"
                min="0"
                step="1"
                value={form.saved_amount}
                onChange={(event) => set("saved_amount", event.target.value)}
                placeholder="0"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="goal-date" className="text-sm font-medium">
              Target date
            </label>
            <input
              id="goal-date"
              type="date"
              min={todayKey()}
              value={form.target_date}
              onChange={(event) => set("target_date", event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
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
              {goal ? "Save changes" : "Create goal"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}