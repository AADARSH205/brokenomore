import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateKey, isBookableDate, monthLabel, weekLabel } from "@/lib/booking";

const WEEK_HEADERS = ["M", "T", "W", "T", "F", "S", "S"];

function cellsFor(mode, cursor, weekStart) {
  const cells = [];

  if (mode === "weekly") {
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(weekStart);
      day.setUTCDate(day.getUTCDate() + i);
      cells.push({ year: day.getUTCFullYear(), month: day.getUTCMonth(), day: day.getUTCDate() });
    }
    return cells;
  }

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const total = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();

  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) cells.push({ year: cursor.year, month: cursor.month, day: d });
  return cells;
}

export default function CalendarPane({ mode, onMode, cursor, weekStart, selectedKey, onPick, onPrev, onNext, now }) {
  const cells = cellsFor(mode, cursor, weekStart);
  const label = mode === "weekly" ? weekLabel(weekStart) : monthLabel(cursor.year, cursor.month);

  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-card p-4 sm:p-5 lg:flex-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-ink">Live 15-minute demo</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Mon–Fri</span>
            <span aria-hidden="true" className="text-border">|</span>
            <span>10 AM–6 PM IST</span>
            <span aria-hidden="true" className="text-border">|</span>
            <span>15 min</span>
          </p>
        </div>

        <div className="flex rounded-[10px] bg-background p-[3px]" role="group" aria-label="Calendar view">
          {["weekly", "monthly"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onMode(option)}
              aria-pressed={mode === option}
              className={cn(
                "rounded-[7px] px-4 py-1.5 text-sm capitalize transition-colors",
                mode === option ? "bg-accent font-medium text-ink" : "text-ink/70 hover:text-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium uppercase tracking-[0.08em] text-ink">{label}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Earlier"
              className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-background text-ink transition-colors hover:bg-background/60"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Later"
              className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-background text-ink transition-colors hover:bg-background/60"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-x-1">
          {WEEK_HEADERS.map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="pb-2 text-center text-xs font-medium uppercase text-muted-foreground"
              aria-hidden="true"
            >
              {day}
            </div>
          ))}

          {cells.map((cell, index) => {
            if (!cell) return <div key={`blank-${index}`} />;

            const key = dateKey(cell.year, cell.month, cell.day);
            const open = isBookableDate(cell.year, cell.month, cell.day, now);
            const chosen = key === selectedKey;
            const isToday = key === dateKey(now.year, now.month, now.day);

            return (
              <button
                key={key}
                type="button"
                disabled={!open}
                onClick={() => onPick({ ...cell, key })}
                aria-pressed={chosen}
                aria-label={open ? `Book ${key}` : undefined}
                className={cn(
                  "relative mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                  open
                    ? "bg-primary font-medium text-primary-foreground hover:bg-primary/85"
                    : "text-muted-foreground/50",
                  chosen && "bg-accent text-ink hover:bg-accent",
                )}
              >
                {cell.day}
                {isToday && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1 w-1 rounded-full",
                      chosen ? "bg-ink" : open ? "bg-primary-foreground/70" : "bg-muted-foreground/40",
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-auto text-xs leading-relaxed text-muted-foreground">
        Weekdays only. Green days are open; grey days are past or outside the next eight weeks.
      </p>
    </div>
  );
}