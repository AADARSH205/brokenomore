import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { saveProfile } from "@/lib/finance-fns";

const BLANK = {
  display_name: "",
  monthly_income: "",
  extra_income: "",
  salary_day: "1",
  monthly_savings_target: "",
  safety_buffer: "",
};

/** The first-run form. Three numbers is all the dashboard needs to start working. */
export default function SetupForm({ profile, onSaved, mode = "setup" }) {
  const editing = mode === "edit";
  const [form, setForm] = useState({
    ...BLANK,
    display_name: profile?.display_name ?? "",
    monthly_income: profile?.monthly_income ? String(profile.monthly_income) : "",
    extra_income: profile?.extra_income ? String(profile.extra_income) : "",
    salary_day: String(profile?.salary_day ?? 1),
    monthly_savings_target: profile?.monthly_savings_target ? String(profile.monthly_savings_target) : "",
    safety_buffer: profile?.safety_buffer ? String(profile.safety_buffer) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = useServerFn(saveProfile);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const number = (value) => (value === "" ? 0 : Number(value));

  const submit = async (event) => {
    event.preventDefault();
    if (number(form.monthly_income) <= 0) {
      setError("Enter your monthly take-home salary so the daily number means something.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await save({
        data: {
          id: profile?.id,
          display_name: form.display_name.trim(),
          monthly_income: number(form.monthly_income),
          extra_income: number(form.extra_income),
          salary_day: Number(form.salary_day) || 1,
          monthly_savings_target: number(form.monthly_savings_target),
          safety_buffer: number(form.safety_buffer),
        },
      });
      toast.success("Your plan is set up");
      onSaved?.();
    } catch (submitError) {
      setError(submitError?.message || "That did not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      {!editing && (
        <p className="inline-flex items-center gap-2 rounded-full bg-positive-soft px-3 py-1 text-xs font-medium text-positive">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Two minutes to set up
        </p>
      )}
      <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
        {editing ? "Your numbers" : "Start with your salary"}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {editing
          ? "Change these whenever your salary, rent or savings target changes. The daily number updates straight away."
          : "We keep rent, bills and savings aside first, then split what is left across the days until your next salary. Nothing connects to your bank."}
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="setup-name" className="text-sm font-medium">
            Your name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="setup-name"
            value={form.display_name}
            onChange={(event) => set("display_name", event.target.value)}
            maxLength={60}
            placeholder="Aarav"
            className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="setup-income" className="text-sm font-medium">
            Monthly take-home (₹)
          </label>
          <input
            id="setup-income"
            type="number"
            min="0"
            step="1"
            value={form.monthly_income}
            onChange={(event) => set("monthly_income", event.target.value)}
            placeholder="45000"
            className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="setup-salary-day" className="text-sm font-medium">
            Salary day
          </label>
          <input
            id="setup-salary-day"
            type="number"
            min="1"
            max="31"
            value={form.salary_day}
            onChange={(event) => set("salary_day", event.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="setup-savings" className="text-sm font-medium">
            Monthly savings target (₹)
          </label>
          <input
            id="setup-savings"
            type="number"
            min="0"
            step="1"
            value={form.monthly_savings_target}
            onChange={(event) => set("monthly_savings_target", event.target.value)}
            placeholder="6000"
            className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="setup-buffer" className="text-sm font-medium">
            Safety buffer (₹) <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="setup-buffer"
            type="number"
            min="0"
            step="1"
            value={form.safety_buffer}
            onChange={(event) => set("safety_buffer", event.target.value)}
            placeholder="1000"
            className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive sm:col-span-2" role="alert">
            {error}
          </p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {editing ? "Save changes" : "Show me my number"}
          </button>
        </div>
      </form>
    </div>
  );
}