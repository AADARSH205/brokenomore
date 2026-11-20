import { Info, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/money";
import { formatDay } from "@/lib/format";

export default function SafeToSpendCard({ result, daysLeft, nextSalaryKey }) {
  const short = result.status === "shortfall";

  return (
    <section
      aria-labelledby="safe-to-spend"
      className="relative overflow-hidden rounded-3xl border border-border bg-primary px-5 py-6 text-primary-foreground sm:px-8 sm:py-8"
    >
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            id="safe-to-spend"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary-foreground/70"
          >
            Safe to spend today
          </p>
          <p className="mt-2 font-display text-[clamp(2.4rem,7vw,3.6rem)] font-semibold leading-none">
            {formatINR(result.perDay)}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/80">
            {short
              ? `Your commitments are ${formatINR(result.shortfall)} more than what is left this month. Everything below shows exactly where it went.`
              : `That is what is left for each of the ${daysLeft} day${daysLeft === 1 ? "" : "s"} until your next salary on ${formatDay(nextSalaryKey, { year: undefined })}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs text-primary-foreground/85">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Savings and unpaid bills are already held back
        </div>
      </div>

      <dl className="relative z-10 mt-7 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-primary-foreground/15 pt-5 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Take-home", value: result.inHand },
          { label: "Savings set aside", value: result.savings },
          { label: "Safety buffer", value: result.buffer },
          { label: "Unpaid bills", value: result.bills },
          { label: "Spent so far", value: result.spent },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-[11px] uppercase tracking-[0.1em] text-primary-foreground/60">{item.label}</dt>
            <dd className="mt-1 font-medium">{formatINR(item.value)}</dd>
          </div>
        ))}
      </dl>

      <p className="relative z-10 mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-primary-foreground/65">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {short
          ? "Nothing is hidden: this number updates the moment you record an expense or pay a bill."
          : `Left in the flexible pot: ${formatINR(Math.max(0, result.pool))}, spread over ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Record a spend and it changes straight away.`}
      </p>
    </section>
  );
}