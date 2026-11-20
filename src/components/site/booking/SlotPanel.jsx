import { ArrowLeft, Check, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONTHS_SHORT, endTime, longDate } from "@/lib/booking";

export default function SlotPanel({
  selected,
  slots,
  slot,
  onSlot,
  step,
  form,
  setForm,
  onSubmit,
  status,
  onBack,
  onBook,
  onReset,
  isToday,
}) {
  const loading = status.state === "loading";
  const { day, month, year, key } = selected;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between rounded-[20px] bg-accent px-4 py-3 text-ink">
        <span className="font-display text-[64px] font-semibold leading-[0.85] tracking-[-0.04em]">{day}</span>
        <span className="pt-1 text-sm font-medium uppercase tracking-[0.04em]">
          {MONTHS_SHORT[month]} {year}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded-[20px] bg-card p-4">
        {step === "pick" && (
          <>
            <div>
              <p className="text-sm text-ink">Pick a time</p>
              <p className="text-xs text-muted-foreground">{longDate(key)} · 15 minutes</p>
            </div>

            {slots.length === 0 ? (
              <p className="rounded-xl bg-background px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                {isToday
                  ? "Today's times have passed. Pick the next weekday."
                  : "Every time that day is taken. Pick another weekday."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {slots.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSlot(option)}
                    aria-pressed={slot === option}
                    className={cn(
                      "rounded-[10px] px-2 py-2.5 text-sm transition-colors",
                      slot === option
                        ? "bg-accent font-medium text-ink"
                        : "bg-background text-ink hover:bg-background/70",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-auto pt-2">
              <button
                type="button"
                disabled={!slot}
                onClick={onBook}
                className="group relative flex h-11 w-full items-center overflow-hidden rounded-xl bg-primary pl-2 pr-3 transition-transform active:scale-[0.98] disabled:bg-primary/30 disabled:active:scale-100"
              >
                <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg bg-background transition-colors group-enabled:group-hover:bg-accent">
                  <ChevronRight className="h-4 w-4 text-ink" aria-hidden="true" />
                </span>
                <span className="flex-1 pl-2 text-center text-sm font-medium text-primary-foreground">
                  Book a 15-min slot
                </span>
              </button>
            </div>
          </>
        )}

        {step === "details" && (
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {longDate(key)}, {slot}
            </button>

            <label className="block text-xs font-medium text-ink">
              Your name
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                autoComplete="name"
                className="mt-1 h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm text-foreground"
              />
            </label>

            <label className="block text-xs font-medium text-ink">
              Email or mobile
              <input
                type="text"
                required
                value={form.contact}
                onChange={(event) => setForm({ ...form, contact: event.target.value })}
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1 h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </label>

            <label className="block text-xs font-medium text-ink">
              Anything to cover? (optional)
              <textarea
                rows={2}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="mt-1 w-full resize-none rounded-[10px] border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>

            {status.state === "error" && (
              <p className="text-xs leading-relaxed text-destructive" role="alert">
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center" role="status">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-ink">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-ink">You are booked!</p>
            <p className="text-sm text-ink">{longDate(key)}</p>
            <p className="text-sm text-ink">
              {slot}–{endTime(slot)} IST
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              We will send the call link before the call. Reply to that mail to move it.
            </p>
            <button
              type="button"
              onClick={onReset}
              className="mt-3 text-xs font-medium text-ink underline underline-offset-2"
            >
              Book another time
            </button>
          </div>
        )}
      </div>
    </div>
  );
}