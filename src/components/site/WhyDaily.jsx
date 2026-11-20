import { Lock, Lightbulb, Sparkles, Utensils } from "lucide-react";

const CARDS = [
  {
    icon: Utensils,
    title: "Built for Indian spends",
    body:
      "Chai, auto, the 11pm Swiggy order, the ₹1,200 share of a friend's birthday gift. The small, constant spends that add up quietly are the ones it watches.",
  },
  {
    icon: Sparkles,
    title: "1-tap fixes",
    body:
      "Wrong category? Not your spend? One tap and today's number updates. No forms, no support ticket, no waiting for someone to reply.",
  },
  {
    icon: Lightbulb,
    title: "Honest suggestions",
    body:
      "When you overspend, it tells you the truth in one calm sentence and shows tomorrow's smaller number. No lectures, no red alarms, no shame.",
  },
  {
    icon: Lock,
    title: "Privacy and security",
    body:
      "Zero bank logins, 100% manual entry. Encrypted in transit and at rest, with zero selling or sharing of your data. Export or delete your records anytime in one click.",
  },
];

export default function WhyDaily() {
  return (
    <section aria-labelledby="why-heading" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Why people open it daily
          </p>
          <h2 id="why-heading" className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight">
            Most money apps are a report. This one is a decision.
          </h2>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.title} className="rounded-3xl border border-border bg-card p-6 sm:p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}