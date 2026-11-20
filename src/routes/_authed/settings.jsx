import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Clock, Download, Loader2, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import PageHeader from "@/components/app/PageHeader";
import SetupForm from "@/components/app/SetupForm";
import ConfirmDialog from "@/components/app/ConfirmDialog";
import useFinanceData from "@/hooks/useFinanceData";
import { clearMyData, exportMyData } from "@/lib/finance-fns";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Settings — BrokeNoMore" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { profile, loading, reload } = useFinanceData(undefined, ["profile"]);
  const { user, logout } = useAuth();
  const exportData = useServerFn(exportMyData);
  const clearData = useServerFn(clearMyData);
  const [busy, setBusy] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [dailyReminder, setDailyReminder] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("brokenomore_daily_reminder") !== "false";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    if (typeof window === "undefined") return "09:00";
    return localStorage.getItem("brokenomore_reminder_time") || "09:00";
  });

  const toggleReminder = (enabled) => {
    setDailyReminder(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("brokenomore_daily_reminder", enabled ? "true" : "false");
    }
    toast.success(enabled ? `Daily reminder set for ${reminderTime}` : "Daily reminder paused");
  };

  const changeReminderTime = (time) => {
    setReminderTime(time);
    if (typeof window !== "undefined") {
      localStorage.setItem("brokenomore_reminder_time", time);
    }
    toast.success(`Reminder time updated to ${time}`);
  };

  const download = async () => {
    setBusy("export");
    try {
      const payload = await exportData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `brokenomore-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Your data is downloaded");
    } catch (error) {
      toast.error(error?.message || "The export failed. Please try again.");
    } finally {
      setBusy("");
    }
  };

  const erase = async () => {
    setBusy("delete");
    try {
      await clearData({ data: { confirm: "DELETE" } });
      toast.success("All financial data deleted");
      setConfirmOpen(false);
      reload();
    } catch (error) {
      toast.error(error?.message || "That did not delete. Please try again.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Your account and your data"
        description="Everything here belongs to you. Export it or delete it whenever you want, without asking us."
      />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold tracking-tight">Signed in as</h2>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email ?? "—"}</p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-secondary" />
      ) : (
        <SetupForm profile={profile} onSaved={reload} mode="edit" />
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">Daily morning reminder</h2>
              <p className="text-xs text-muted-foreground">
                Get your safe-to-spend figure every morning without opening social media.
              </p>
            </div>
          </div>
          <Switch
            id="settings-reminder"
            checked={dailyReminder}
            onCheckedChange={toggleReminder}
          />
        </div>

        {dailyReminder && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 text-xs">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Reminder time:</span>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => changeReminderTime(e.target.value)}
              className="h-8 rounded-lg border border-input bg-card px-2 text-xs font-semibold"
            />
            <span className="text-muted-foreground">every morning</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold tracking-tight">Your data</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          BrokeNoMore stores only what you type: your salary, expenses, budgets, goals, SIPs and tax figures. No bank
          passwords, no UPI PINs, no card numbers, and no bank connection.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={download}
            disabled={busy === "export"}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {busy === "export" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            Export everything (JSON)
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete all financial data
          </button>
        </div>

        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Only you can read your records. Your account stays, so you can start again with a clean slate.
        </p>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete all your financial data?"
        description="Every expense, budget, bill, goal, SIP and tax figure is removed permanently. This cannot be undone."
        confirmLabel={busy === "delete" ? "Deleting…" : "Delete everything"}
        onConfirm={erase}
      />
    </div>
  );
}