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
import { saveSip } from "@/lib/finance-fns";
import { todayKey } from "@/lib/finance";

const BLANK = {
  fund_name: "",
  monthly_amount: "",
  start_date: todayKey(),
  sip_day: String(new Date().getDate()),
  goal: "",
  duration_years: "10",
  status: "active",
};

export default function SipDialog({ open, onOpenChange, sip, onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = useServerFn(saveSip);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      sip
        ? {
            fund_name: sip.fund_name ?? "",
            monthly_amount: String(sip.monthly_amount ?? ""),
            start_date: sip.start_date ?? todayKey(),
            sip_day: String(sip.sip_day ?? 5),
            goal: sip.goal ?? "",
            duration_years: String(sip.duration_years ?? 10),
            status: sip.status ?? "active",
          }
        : BLANK,
    );
  }, [open, sip]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(form.monthly_amount);
    const day = Number(form.sip_day);
    if (!form.fund_name.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError("Add the fund name and a monthly amount above zero.");
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      setError("The SIP date must be a day between 1 and 31.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await save({
        data: {
          id: sip?.id,
          fund_name: form.fund_name.trim(),
          monthly_amount: amount,
          start_date: form.start_date,
          sip_day: day,
          goal: form.goal.trim(),
          duration_years: Number(form.duration_years) || 10,
          status: form.status,
        },
      });
      toast.success(sip ? "SIP updated" : "SIP added");
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
          <DialogTitle>{sip ? "Edit SIP" : "Add a SIP"}</DialogTitle>
          <DialogDescription>
            Record the SIP you already run. BrokeNoMore does not place orders or move money.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="sip-fund" className="text-sm font-medium">
              Fund or scheme name
            </label>
            <input
              id="sip-fund"
              value={form.fund_name}
              onChange={(event) => set("fund_name", event.target.value)}
              maxLength={80}
              placeholder="Nifty 50 index fund"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sip-amount" className="text-sm font-medium">
                Monthly amount (₹)
              </label>
              <input
                id="sip-amount"
                type="number"
                min="100"
                step="100"
                value={form.monthly_amount}
                onChange={(event) => set("monthly_amount", event.target.value)}
                placeholder="5000"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="sip-day" className="text-sm font-medium">
                SIP date
              </label>
              <input
                id="sip-day"
                type="number"
                min="1"
                max="31"
                value={form.sip_day}
                onChange={(event) => set("sip_day", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sip-start" className="text-sm font-medium">
                Started on
              </label>
              <input
                id="sip-start"
                type="date"
                value={form.start_date}
                onChange={(event) => set("start_date", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="sip-duration" className="text-sm font-medium">
                Plan to invest (years)
              </label>
              <input
                id="sip-duration"
                type="number"
                min="1"
                max="50"
                value={form.duration_years}
                onChange={(event) => set("duration_years", event.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sip-goal" className="text-sm font-medium">
              What is it for? <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="sip-goal"
              value={form.goal}
              onChange={(event) => set("goal", event.target.value)}
              maxLength={80}
              placeholder="Long-term wealth"
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="sip-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="sip-status"
              value={form.status}
              onChange={(event) => set("status", event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
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
              {sip ? "Save changes" : "Add SIP"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}