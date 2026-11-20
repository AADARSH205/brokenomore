import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { setBillPaid } from "@/lib/finance-fns";
import { formatINR } from "@/lib/money";
import { ordinal } from "@/lib/format";
import { categoryMeta } from "@/lib/categories";

export default function UpcomingBills({ bills = [], payments = [], month, onChanged }) {
  const [busy, setBusy] = useState(null);
  const toggle = useServerFn(setBillPaid);
  const paidIds = new Set(payments.map((payment) => payment.bill_id));

  const rows = [...bills].sort((a, b) => {
    const aPaid = paidIds.has(a.id) ? 1 : 0;
    const bPaid = paidIds.has(b.id) ? 1 : 0;
    if (aPaid !== bPaid) return aPaid - bPaid;
    return Number(a.due_day) - Number(b.due_day);
  });

  const run = async (bill, paid) => {
    setBusy(bill.id);
    try {
      await toggle({ data: { bill_id: bill.id, month, paid } });
      toast.success(paid ? `${bill.name} marked paid and added to expenses` : `${bill.name} moved back to unpaid`);
      onChanged?.();
    } catch (error) {
      toast.error(error?.message || "That did not update. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        No recurring bills yet. Add rent, electricity or your phone bill and they will be held back from the
        daily number until you pay them.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((bill) => {
        const paid = paidIds.has(bill.id);
        const meta = categoryMeta(bill.category);
        return (
          <li key={bill.id} className="flex items-center gap-3 py-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{bill.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatINR(Number(bill.amount) || 0)} · due {ordinal(bill.due_day)}
                {paid ? " · paid" : bill.is_essential === false ? " · flexible" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => run(bill, !paid)}
              disabled={busy === bill.id}
              className={
                paid
                  ? "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  : "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              }
            >
              {busy === bill.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : paid ? (
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {paid ? "Undo" : "Mark paid"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}