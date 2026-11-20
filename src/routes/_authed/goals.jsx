import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/app/PageHeader";
import StatCard from "@/components/app/StatCard";
import EmptyState from "@/components/app/EmptyState";
import ConfirmDialog from "@/components/app/ConfirmDialog";
import GoalCard from "@/components/goals/GoalCard";
import GoalDialog from "@/components/goals/GoalDialog";
import AddMoneyDialog from "@/components/goals/AddMoneyDialog";
import useFinanceData from "@/hooks/useFinanceData";
import { deleteGoal } from "@/lib/finance-fns";
import { goalProgress } from "@/lib/finance";
import { formatINR } from "@/lib/money";

export const Route = createFileRoute("/_authed/goals")({
  ssr: false,
  head: () => ({ meta: [{ title: "Saving goals — BrokeNoMore" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, loading, error, reload } = useFinanceData(undefined, ["goals"]);
  const [dialog, setDialog] = useState({ open: false, goal: null });
  const [money, setMoney] = useState({ open: false, goal: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const remove = useServerFn(deleteGoal);

  const rows = goals.map((goal) => ({ goal, progress: goalProgress(goal) }));
  const totalTarget = rows.reduce((sum, row) => sum + row.progress.target, 0);
  const totalSaved = rows.reduce((sum, row) => sum + row.progress.saved, 0);
  const monthlyNeeded = rows.reduce((sum, row) => sum + row.progress.suggestedMonthly, 0);
  const completed = rows.filter((row) => row.progress.done).length;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove({ data: { id: pendingDelete.id } });
      toast.success("Goal deleted");
      setPendingDelete(null);
      reload();
    } catch (deleteError) {
      toast.error(deleteError?.message || "That did not delete. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Saving goals"
        title="What are you saving for?"
        description="An emergency fund first, then the things you actually want. Each goal gets its own monthly number."
        actions={
          <button
            type="button"
            onClick={() => setDialog({ open: true, goal: null })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New goal
          </button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-medium">We could not load your goals.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <button type="button" onClick={reload} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total target"
              value={formatINR(totalTarget)}
              hint={`${goals.length} goal${goals.length === 1 ? "" : "s"}`}
              icon={Target}
            />
            <StatCard label="Saved so far" value={formatINR(totalSaved)} tone="good" hint="Across every goal" />
            <StatCard
              label="Needed each month"
              value={formatINR(monthlyNeeded)}
              hint="To stay on every target date"
              tone={monthlyNeeded > 0 ? "default" : "good"}
            />
            <StatCard label="Goals completed" value={`${completed}`} hint="Nice work" />
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1].map((key) => (
                <div key={key} className="h-56 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              body="Start with an emergency fund of three months of expenses. It is the goal that keeps every other goal safe."
              action={
                <button
                  type="button"
                  onClick={() => setDialog({ open: true, goal: null })}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Create a goal
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map(({ goal }) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAdd={(item) => setMoney({ open: true, goal: item })}
                  onEdit={(item) => setDialog({ open: true, goal: item })}
                  onDelete={(item) => setPendingDelete(item)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <GoalDialog
        open={dialog.open}
        goal={dialog.goal}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onSaved={reload}
      />

      {money.goal && (
        <AddMoneyDialog
          open={money.open}
          goal={money.goal}
          onOpenChange={(open) => setMoney((current) => ({ ...current, open }))}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this goal?"
        description={pendingDelete ? `${pendingDelete.name} and its saved amount will be removed from your plan.` : ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
}