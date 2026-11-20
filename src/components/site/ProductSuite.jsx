import { Link } from "@tanstack/react-router";
import { ArrowRight, Landmark, LayoutDashboard, Receipt, Target, TrendingUp, Wallet } from "lucide-react";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Safe to spend today",
    body: "One number, recalculated every time you record a spend, pay a bill or adjust a budget category.",
  },
  {
    icon: Receipt,
    title: "Expense tracking",
    body: "Add, edit and search expenses by category. Weekly and monthly reports show what actually moved.",
  },
  {
    icon: Wallet,
    title: "Monthly budget planner",
    body: "A ceiling per category, with a warning at 80% and a plain answer when you go over.",
  },
  {
    icon: Landmark,
    title: "Indian tax planner",
    body: "Old regime against new, with HRA, 80C, 80D, NPS and home loan interest, for this financial year.",
  },
  {
    icon: TrendingUp,
    title: "SIP and investment planner",
    body: "Project a SIP with step-up and three return scenarios, then track what you actually invest.",
  },
  {
    icon: Target,
    title: "Saving goals",
    body: "Emergency fund, laptop, vacation. Each goal gets a monthly number and an honest progress bar.",
  },
];

export default function ProductSuite() {
  return (
    <section id="product" aria-labelledby="product-heading" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          What you get
        </p>
        <h2
          id="product-heading"
          className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight"
        >
          Earn your salary. Control your expenses. Save on tax. Invest for later.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Six tools that share the same numbers, so a coffee you log this morning changes the budget, the
          goal and the tax-free saving you see this evening. Free web app for young salaried Indians. Android app coming soon.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-positive-soft text-positive">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          to="/register"
          search={{ returnTo: "/dashboard" }}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start free
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="text-xs text-muted-foreground">
          100% web app. Email and password only. Zero bank login, zero card details, manual entry for total privacy.
        </p>
      </div>
    </section>
  );
}
