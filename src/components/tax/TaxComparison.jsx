import { Check, X } from "lucide-react";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

function RegimeCard({ result, best, other }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-soft",
        best ? "border-positive/50 ring-1 ring-positive/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">{result.label}</h3>
          <p className="text-xs text-muted-foreground">{result.financialYear}</p>
        </div>
        {best && (
          <span className="rounded-full bg-positive-soft px-2.5 py-1 text-[11px] font-medium text-positive">
            Cheaper for you
          </span>
        )}
      </div>

      <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{formatINR(result.total)}</p>
      <p className="text-xs text-muted-foreground">estimated tax for the year</p>

      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Taxable income</dt>
          <dd className="tabular-nums">{formatINR(result.taxable)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Monthly TDS</dt>
          <dd className="tabular-nums">{formatINR(result.monthly)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Effective rate</dt>
          <dd className="tabular-nums">{result.effectiveRate}%</dd>
        </div>
      </dl>

      {!best && other && (
        <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          {formatINR(result.total - other.total)} more than the other regime with these numbers.
        </p>
      )}
    </div>
  );
}

function Row({ label, left, right, strong }) {
  return (
    <tr className={strong ? "font-medium" : undefined}>
      <td className="py-2 pr-3 text-muted-foreground">{label}</td>
      <td className="py-2 pr-3 text-right tabular-nums">{left}</td>
      <td className="py-2 text-right tabular-nums">{right}</td>
    </tr>
  );
}

export default function TaxComparison({ comparison, rules }) {
  const { new: newResult, old: oldResult, better, saving } = comparison;
  const isZeroTax = (better === "new" ? newResult.total : oldResult.total) === 0;

  return (
    <div className="space-y-4">
      {/* RESULT FIRST BANNER */}
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-5",
          isZeroTax
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
            : better === "equal"
              ? "border-border bg-secondary/50 text-foreground"
              : "border-primary/30 bg-primary/10 text-foreground"
        )}
      >
        <p className="font-display text-lg font-semibold tracking-tight sm:text-xl">
          {comparison.summaryText || (
            better === "equal"
              ? `Your tax: ${formatINR(newResult.total)} under New, ${formatINR(oldResult.total)} under Old. Both regimes work out identical.`
              : `Your tax: ${formatINR(newResult.total)} under New, ${formatINR(oldResult.total)} under Old. Better for you: ${better === "new" ? "New regime" : "Old regime"}, saves ${formatINR(saving)}.`
          )}
        </p>

        {isZeroTax && comparison.zeroTaxExplanation && (
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-background/80 p-3.5 text-xs leading-relaxed text-foreground">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero tax explanation: </span>
            {comparison.zeroTaxExplanation}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RegimeCard result={newResult} best={better === "new"} other={oldResult} />
        <RegimeCard result={oldResult} best={better === "old"} other={newResult} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-display text-lg font-semibold tracking-tight">Line by line</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-3 text-left font-medium">Item</th>
                <th className="pb-2 pr-3 text-right font-medium">New</th>
                <th className="pb-2 text-right font-medium">Old</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <Row label="Gross salary" left={formatINR(newResult.gross)} right={formatINR(oldResult.gross)} />
              <Row label="Total deductions" left={formatINR(newResult.deductions)} right={formatINR(oldResult.deductions)} />
              <Row label="Taxable income" left={formatINR(newResult.taxable)} right={formatINR(oldResult.taxable)} />
              <Row label="Tax on slabs" left={formatINR(newResult.baseTax)} right={formatINR(oldResult.baseTax)} />
              <Row label="Rebate 87A" left={`-${formatINR(newResult.rebate)}`} right={`-${formatINR(oldResult.rebate)}`} />
              {newResult.marginalRelief > 0 && (
                <Row label="Marginal relief" left={`-${formatINR(newResult.marginalRelief)}`} right="—" />
              )}
              <Row label="Surcharge" left={formatINR(newResult.surcharge)} right={formatINR(oldResult.surcharge)} />
              <Row label="Health and education cess" left={formatINR(newResult.cess)} right={formatINR(oldResult.cess)} />
              <Row label="Total tax" left={formatINR(newResult.total)} right={formatINR(oldResult.total)} strong />
              <Row label="Monthly TDS" left={formatINR(newResult.monthly)} right={formatINR(oldResult.monthly)} strong />
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: "new", label: rules.new.name, allowed: rules.new.allowed, blocked: rules.new.notAllowed },
          { key: "old", label: rules.old.name, allowed: rules.old.allowed, blocked: rules.old.notAllowed },
        ].map((regime) => (
          <div key={regime.key} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-display text-base font-semibold tracking-tight">{regime.label}: what counts</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              {regime.allowed.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
              {regime.blocked.map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-display text-base font-semibold tracking-tight">Deductions used, new regime</h3>
        {newResult.lines.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            None. The new regime gives you the flat standard deduction and nothing else unless your employer
            contributes to NPS.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm">
            {newResult.lines.map((line) => (
              <li key={line.label} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{line.label}</span>
                <span className="tabular-nums">{formatINR(line.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-display text-base font-semibold tracking-tight">Deductions used, old regime</h3>
        {oldResult.lines.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">None entered yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {oldResult.lines.map((line) => (
              <li key={line.label}>
                <div className="flex justify-between gap-3">
                  <span>{line.label}</span>
                  <span className="tabular-nums">{formatINR(line.amount)}</span>
                </div>
                {line.note && <p className="text-[11px] text-muted-foreground">{line.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}