import { Pencil, Repeat, Trash2 } from "lucide-react";
import { categoryMeta, paymentLabel } from "@/lib/categories";
import { formatINR } from "@/lib/money";

export default function ExpenseRow({ expense, onEdit, onDelete }) {
  const meta = categoryMeta(expense.category);

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        className="h-8 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {expense.description || meta.label}
          {expense.is_planned && (
            <span className="ml-2 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
              planned
            </span>
          )}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {meta.label} · {paymentLabel(expense.payment_method)}
          {expense.is_recurring && <Repeat className="h-3 w-3" aria-label="Recurring" />}
        </p>
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums">{formatINR(Number(expense.amount) || 0)}</span>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(expense)}
          aria-label={`Edit ${expense.description || meta.label}`}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(expense)}
          aria-label={`Delete ${expense.description || meta.label}`}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}