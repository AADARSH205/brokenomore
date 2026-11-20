import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  good: { icon: CheckCircle2, className: "border-positive/30 bg-positive-soft/60 text-positive" },
  warn: { icon: TriangleAlert, className: "border-warning/30 bg-warning-soft/60 text-warning" },
  info: { icon: Info, className: "border-border bg-secondary/60 text-foreground" },
};

export default function InsightList({ insights = [], title = "Today's summary" }) {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="mt-4 space-y-3">
        {insights.map((insight, index) => {
          const tone = TONES[insight.tone] ?? TONES.info;
          const Icon = tone.icon;
          return (
            <li
              key={`${insight.tone}-${index}`}
              className={cn("flex items-start gap-2.5 rounded-xl border px-3 py-2.5", tone.className)}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="text-[13px] leading-relaxed text-foreground/90">{insight.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}