import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, CheckCircle2, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import PilotForm from "@/components/site/PilotForm";
import { site } from "@/config/site";

const BENEFITS = [
  {
    icon: Users,
    title: "First-job friendly",
    body: "Most of your new hires are navigating rent, bills, and savings for the first time. One daily safe number beats an intimidating spreadsheet or complex tracker.",
  },
  {
    icon: HeartHandshake,
    title: "Fewer payday loans and cash advances",
    body: "Team members who know their safe daily spend lean on credit cards and salary advances far less. Less financial stress means higher focus and retention.",
  },
  {
    icon: BarChart3,
    title: "Aggregate wellbeing metrics only",
    body: "HR receives anonymised, aggregate wellbeing trends across the team. We never disclose an individual's salary, personal expenses, or bank figures.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    body: "Zero bank credentials stored, no payroll system integration required, and employees can export or wipe their financial records at any moment.",
  },
];

const COMPANY_FAQS = [
  {
    q: "How does a company pilot work?",
    a: "We provide your new-joiner cohort with free access to BrokeNoMore for a full quarter, conduct a 30-minute interactive financial kickoff workshop, and provide HR with an anonymised quarterly wellbeing summary.",
  },
  {
    q: "Do we need to connect our payroll software?",
    a: "No. BrokeNoMore requires no HRMS or payroll integration. Employees simply use the web app directly, keeping setup effort at zero for your IT and security teams.",
  },
  {
    q: "What data does the employer see?",
    a: "Only aggregate, anonymised wellbeing indicators (e.g., % of employees setting aside savings, general financial confidence trends). Individual budgets, salaries, or spends are strictly private to each employee.",
  },
];

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Company Financial Wellbeing Pilots — BrokeNoMore" },
      {
        name: "description",
        content:
          "Pilot BrokeNoMore for your early-career team. Give first-job employees daily financial calm, fewer credit emergencies, and zero payroll integration headaches.",
      },
      { property: "og:title", content: "Company Pilots — BrokeNoMore" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${site.url}/companies` },
    ],
    links: [{ rel: "canonical", href: `${site.url}/companies` }],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav base="/" />
      <main>
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-6xl px-5 py-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to main site
            </a>
          </div>
        </div>

        <section aria-labelledby="companies-hero-heading" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                For Employers &amp; HR Leaders
              </p>
              <h1
                id="companies-hero-heading"
                className="mt-3 font-display text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-tight tracking-tight"
              >
                Financial calm for the people you just hired.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Fresh graduates and early-career hires face the shock of managing rent, utility bills, and personal taxes all at once. A BrokeNoMore company pilot gives your team a daily spending guard for a full quarter, with zero payroll integration required.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={benefit.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-olive-soft text-ink">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <h3 className="mt-3.5 text-sm font-semibold">{benefit.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{benefit.body}</p>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5">
                <h3 className="text-sm font-semibold">What’s included in a 90-day pilot:</h3>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    Unlimited access to the daily safe-to-spend web app for your team
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    30-minute interactive "First Salary &amp; Tax Demystified" onboarding workshop
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    Anonymised quarterly financial wellness insights report for HR
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    Dedicated email channel for new-hire questions
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                <h2 className="text-lg font-semibold tracking-tight">Request a company pilot</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in these quick details. A human from our team will reply within two working days.
                </p>
                <div className="mt-6">
                  <PilotForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="companies-faq-heading" className="border-t border-border bg-secondary/40 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5">
            <h2 id="companies-faq-heading" className="text-2xl font-semibold tracking-tight">
              Frequently asked questions by employers
            </h2>
            <div className="mt-8 space-y-4">
              {COMPANY_FAQS.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-base font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
