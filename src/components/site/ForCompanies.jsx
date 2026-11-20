import { BarChart3, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import PilotForm from "@/components/site/PilotForm";

const BENEFITS = [
  {
    icon: Users,
    title: "First-job friendly",
    body:
      "Most of your team is working out rent, EMIs and savings for the first time. One calm number beats a spreadsheet nobody opens.",
  },
  {
    icon: HeartHandshake,
    title: "Fewer payday loans",
    body:
      "People who know what is safe to spend lean on salary advances and credit cards less. That is the point, not a perk.",
  },
  {
    icon: BarChart3,
    title: "Aggregate reporting only",
    body:
      "You get anonymised wellbeing trends for the team. Never an individual's salary, spending or savings.",
  },
  {
    icon: ShieldCheck,
    title: "Read-only by design",
    body:
      "No salary data leaves your payroll, no bank credentials are stored, and consent can be revoked by the employee in one tap.",
  },
];

export default function ForCompanies() {
  return (
    <section id="companies" aria-labelledby="companies-heading" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              For companies
            </p>
            <h2
              id="companies-heading"
              className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight"
            >
              Financial calm for the people you just hired.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              A pilot gives your team the daily number for a quarter, and gives you a report you can
              actually act on. We are taking a small number of pilot companies now.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.title} className="rounded-2xl border border-border bg-card p-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-olive-soft text-ink">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="mt-3.5 text-sm font-semibold">{benefit.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{benefit.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h3 className="text-lg font-semibold tracking-tight">Request a pilot</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Three fields. A person replies within two working days.
            </p>
            <div className="mt-5">
              <PilotForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}