import { CalendarCheck, PiggyBank, Wallet } from "lucide-react";

const STEPS = [
  {
    icon: CalendarCheck,
    kicker: "Step one",
    title: "Reserve essentials",
    body:
      "On payday, rent, EMIs and the bills you have told us about are marked as reserved. Not moved, not held. Just marked, so the rest of the month knows what is already spoken for.",
  },
  {
    icon: PiggyBank,
    kicker: "Step two",
    title: "Protect savings",
    body:
      "Your savings goal is set aside the same way, first, before anything else gets a chance to eat it. Start at ₹500 a month if that is all you have. It still counts.",
  },
  {
    icon: Wallet,
    kicker: "Step three",
    title: "Spend guilt-free",
    body:
      "Each morning you get one number: what is safe to spend today. Spend it, or do not. Either way you are not doing mental arithmetic in a queue at 11pm.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">How it works</p>
        <h2 id="how-heading" className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight">
          Three steps, once a month, then one number a day.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Set it up in the first week of your salary and it keeps going. You can change every number later,
          and nothing is permanent.
        </p>
      </div>

      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-olive-soft text-ink">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-3xl text-muted-foreground/40">0{index + 1}</span>
              </div>
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {step.kicker}
              </p>
              <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Your money stays in your own bank account throughout, and nothing here moves it. There is no bank
        connection today: you record your salary and your spending yourself. Bank sync through the RBI's
        Account Aggregator framework is marked coming soon, and will stay marked that way until it is live.
      </p>
    </section>
  );
}