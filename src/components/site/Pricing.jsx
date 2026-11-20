import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { site, pricing } from "@/config/site";

export default function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
          <h2 id="pricing-heading" className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight">
            Free where it matters. Paid only for the extras.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Last reviewed: {site.asOf.pricing}. Anything not shipped yet is labelled, not sold.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <li
              key={plan.name}
              className={`flex flex-col rounded-3xl border p-6 sm:p-7 ${
                plan.highlight
                  ? "border-accent bg-card shadow-soft ring-1 ring-accent/40"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                {plan.tag && (
                  <span className="rounded-full bg-olive-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-ink">
                    {plan.tag}
                  </span>
                )}
              </div>
              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Link
                  to="/register"
                  search={{ returnTo: "/dashboard" }}
                  className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {plan.cta}
                </Link>
              ) : plan.name === "Companies" ? (
                <a
                  href="/companies"
                  className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-full border border-primary px-5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {plan.cta}
                </a>
              ) : (
                <a
                  href="#waitlist"
                  className="mt-7 inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-secondary/40 px-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {plan.cta}
                </a>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          The core web app is live and free. Pro features and company pilots are in active rollout.
        </p>
      </div>
    </section>
  );
}
