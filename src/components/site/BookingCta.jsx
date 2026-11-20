import { CalendarCheck, MessageSquare, ShieldCheck } from "lucide-react";
import BookingCalendar from "@/components/site/booking/BookingCalendar";

const POINTS = [
  { icon: CalendarCheck, text: "15 minutes, weekdays, 10 AM to 6 PM IST." },
  { icon: MessageSquare, text: "Your own numbers on screen, not a sample. Hindi or English." },
  { icon: ShieldCheck, text: "No bank connection for the demo, nothing to install." },
];

export default function BookingCta() {
  return (
    <section id="book" aria-labelledby="book-heading" className="mx-auto max-w-6xl px-5 pb-16 sm:pb-20">
      <div className="rounded-[2rem] border border-border bg-secondary/40 p-5 sm:p-9">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            The 15-minute demo
          </p>
          <h2
            id="book-heading"
            className="mt-3 text-[clamp(1.7rem,4.2vw,2.5rem)] font-semibold leading-tight tracking-tight"
          >
            See your own number, live.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Bring your salary date, two fixed bills and what you save. In fifteen minutes we put your real
            figures into BrokeNoMore and you see the daily number it gives you. If it is wrong for your month,
            say so on the call.
          </p>
        </div>

        <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
          {POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.text} className="flex items-start gap-2.5 rounded-2xl bg-background/70 px-3.5 py-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="leading-snug text-ink/80">{point.text}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <BookingCalendar />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
          <a
            href="/register"
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-primary px-6 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start free right now
          </a>
          <span>
            Android app user?{" "}
            <a href="#waitlist" className="font-medium text-ink underline underline-offset-2">
              Join the Android waitlist
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}