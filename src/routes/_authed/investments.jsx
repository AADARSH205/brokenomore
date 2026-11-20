import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import EmptyState from "@/components/app/EmptyState";
import ConfirmDialog from "@/components/app/ConfirmDialog";
import SipCalculator from "@/components/sip/SipCalculator";
import SipDialog from "@/components/sip/SipDialog";
import useFinanceData from "@/hooks/useFinanceData";
import { deleteSip } from "@/lib/finance-fns";
import { nextSipDate, sipInvested, sipTotals, todayKey } from "@/lib/finance";
import { formatINR } from "@/lib/money";
import { formatDay } from "@/lib/format";

export const Route = createFileRoute("/_authed/investments")({
  ssr: false,
  head: () => ({ meta: [{ title: "SIP & investments — BrokeNoMore" }] }),
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const { sips, loading, error, reload } = useFinanceData(undefined, ["sips"]);
  const [dialog, setDialog] = useState({ open: false, sip: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const remove = useServerFn(deleteSip);

  const today = todayKey();
  const totals = sipTotals(sips);
  const invested = sips.reduce((sum, sip) => sum + sipInvested(sip, today), 0);
  const upcoming = sips
    .filter((sip) => sip.status !== "paused")
    .map((sip) => ({ sip, on: nextSipDate(sip, today) }))
    .sort((a, b) => (a.on < b.on ? -1 : 1))[0];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove({ data: { id: pendingDelete.id } });
      toast.success("SIP removed");
      setPendingDelete(null);
      reload();
    } catch (deleteError) {
      toast.error(deleteError?.message || "That did not delete. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SIP & investments"
        title="Start small, stay regular"
        description="Record the SIPs you already run, then see what regular investing could grow to. BrokeNoMore never places an order for you."
        actions={
          <button
            type="button"
            onClick={() => setDialog({ open: true, sip: null })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add SIP
          </button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-medium">We could not load your SIPs.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Monthly commitments"
              value={`${formatINR(totals.monthly)}`}
              hint={`${totals.activeCount} active SIP${totals.activeCount === 1 ? "" : "s"}`}
              icon={TrendingUp}
            />
            <StatCard label="Invested so far" value={formatINR(invested)} hint="From the records you added" />
            <StatCard
              label="Next instalment"
              value={upcoming ? formatDay(upcoming.on) : "—"}
              hint={upcoming ? `${upcoming.sip.fund_name} · ${formatINR(upcoming.sip.monthly_amount)}` : "No active SIP"}
              icon={CalendarClock}
            />
            <StatCard
              label="Paused"
              value={String(totals.pausedCount)}
              hint={totals.pausedCount > 0 ? "Still counted in your history" : "Everything running"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold tracking-tight">Your SIPs</h2>
              {loading ? (
                <div className="mt-3 h-24 animate-pulse rounded-xl bg-secondary" />
              ) : sips.length === 0 ? (
                <div className="mt-3">
                  <EmptyState
                    icon={TrendingUp}
                    title="No SIPs recorded yet"
                    body="Even ₹500 a month builds the habit. Add the SIP you already run, or the one you are about to start."
                  />
                </div>
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {sips.map((sip) => (
                    <li key={sip.id} className="py-3">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{sip.fund_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatINR(Number(sip.monthly_amount) || 0)}/mo from {formatDay(sip.start_date, { year: undefined })} ·{" "}
                            {sip.status === "paused" ? "paused" : `next ${formatDay(nextSipDate(sip, today), { year: undefined })}`}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatINR(sipInvested(sip, today))} invested so far
                            {sip.goal ? ` · for ${sip.goal}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDialog({ open: true, sip })}
                          aria-label={`Edit ${sip.fund_name}`}
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(sip)}
                          aria-label={`Delete ${sip.fund_name}`}
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <SipCalculator />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-semibold tracking-tight">The three kinds of mutual fund</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Equity",
                  body: "Invests mostly in company shares. Highest expected return over long periods, and the biggest falls along the way. Money you need in under five years does not belong here.",
                },
                {
                  title: "Debt",
                  body: "Lends to governments or companies through bonds. Steadier, lower returns. Fits money you need in one to three years.",
                },
                {
                  title: "Hybrid",
                  body: "A mix of both. Smoother than pure equity, better than pure debt over long periods. A reasonable single fund for a first investor.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-secondary/60 p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Risk",
                  body: "Risk is the chance of selling at a bad time. Time in the market reduces it more than picking the perfect fund does.",
                },
                {
                  title: "Diversification",
                  body: "One index fund already holds hundreds of companies. Adding five more funds rarely spreads risk further; it just adds work.",
                },
                {
                  title: "Long term",
                  body: "SIPs work because they buy more units when prices fall. Ten years is a reasonable minimum for equity.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-secondary/60 p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
              This is education, not investment advice. BrokeNoMore does not recommend funds, predict returns or
              execute orders. For advice about your own money, talk to a SEBI-registered investment adviser.
            </p>
          </div>
        </>
      )}

      <SipDialog
        open={dialog.open}
        sip={dialog.sip}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSaved={reload}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this SIP?"
        description={pendingDelete ? `${pendingDelete.fund_name} will be removed from your tracker. Nothing happens to the actual investment.` : ""}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
      />
    </div>
  );
}