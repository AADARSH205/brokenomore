import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/money";
import { goalProgress } from "@/lib/finance";
import { formatDay } from "@/lib/format";

export default function GoalCard({ goal, onAdd, onEdit, onDelete }) {
  const progress = goalProgress(goal);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold tracking-tight">{goal.name}</h3>
          <p className="text-xs text-muted-foreground">
            {goal.target_date ? `Target ${formatDay(goal.target_date)}` : "No target date yet"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.name}`}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            aria-label={`Delete ${goal.name}`}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className="mt-4 font-display text-2xl font-semibold">
        {formatINR(progress.saved)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">of {formatINR(progress.target)}</span>
      </p>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={progress.done ? "h-full rounded-full bg-positive" : "h-full rounded-full bg-accent"}
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between text-xs text-muted-foreground">
        <span>{progress.pct}% complete</span>
        <span>{progress.done ? "Goal reached" : `${formatINR(progress.remaining)} left`}</span>
      </div>

      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {progress.done
          ? "Done. Move this to a fixed deposit or keep it where it is and start the next goal."
          : progress.suggestedMonthly > 0
            ? `Saving ${formatINR(progress.suggestedMonthly)} a month gets you there${progress.monthsLeft > 0 ? ` in ${progress.monthsLeft} month${progress.monthsLeft === 1 ? "" : "s"}` : ""}.`
            : `Add ${formatINR(progress.remaining)} to finish it whenever you can.`}
      </p>

      <button
        type="button"
        onClick={() => onAdd(goal)}
        disabled={progress.done}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
      >
        {progress.done ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Completed
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add money
          </>
        )}
      </button>
    </div>
  );
}