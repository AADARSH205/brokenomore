import { cn } from "@/lib/utils";

const TONES = {
  default: "text-foreground",
  good: "text-positive",
  warn: "text-warning",
  bad: "text-destructive",
};

export default function StatCard({ label, value, hint, tone = "default", icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </div>
      <p className={cn("mt-2 font-display text-2xl font-semibold tracking-tight", TONES[tone] ?? TONES.default)}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}