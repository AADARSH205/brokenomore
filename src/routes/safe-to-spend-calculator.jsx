import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { ArrowRight, BellRing, Calculator, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import CalculatorComponent from "@/components/site/Calculator";
import { computeDailyNumber, formatINR } from "@/lib/money";
import { site } from "@/config/site";

const FAQS = [
  {
    q: "What is the Safe-to-Spend daily number?",
    a: "Instead of staring at a big salary balance and guessing whether you can afford dinner on the 18th, the safe-to-spend figure reserves rent, bills, and savings first on payday, then divides what remains across the days left until your next salary.",
  },
  {
    q: "How does this prevent going broke before the end of the month?",
    a: "Traditional monthly budgets fail because humans cannot mentally calculate 30 days of micro-decisions. A single daily spending ceiling tells you instantly whether today's purchase fits your plan.",
  },
  {
    q: "Do I need to connect my bank account to use this calculator?",
    a: "No. BrokeNoMore requires zero bank passwords, zero OTPs, and zero Account Aggregator logins. You enter your own numbers, and the calculation runs instantly in your browser with complete privacy.",
  },
  {
    q: "What happens if I overspend today?",
    a: "If you spend more than today's allowance, the app recalculates tomorrow's allowance by absorbing the difference across remaining days so your rent and savings remain 100% protected.",
  },
];

export const Route = createFileRoute("/safe-to-spend-calculator")({
  head: () => {
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Safe-to-Spend Daily Allowance Calculator — BrokeNoMore",
        url: `${site.url}/safe-to-spend-calculator`,
        applicationCategory: "FinanceApplication",
        description: "Calculate your daily guilt-free spending limit. Holds back rent, bills, and monthly savings on payday.",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];

    return {
      meta: [
        { title: "Safe-to-Spend Daily Allowance Calculator — BrokeNoMore" },
        {
          name: "description",
          content:
            "Find your calm daily spending number. Reserve rent, fixed bills, and savings on payday, then spend freely without mental math or end-of-month broke days.",
        },
        { property: "og:title", content: "Safe-to-Spend Daily Allowance Calculator — BrokeNoMore" },
        {
          property: "og:description",
          content:
            "Calculate your daily spending allowance in 20 seconds. No bank login, 100% private.",
        },
        { property: "og:url", content: `${site.url}/safe-to-spend-calculator` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${site.url}/safe-to-spend-calculator` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: SafeToSpendPage,
});

function SafeToSpendPage() {
  const search = Route.useSearch();

  const sync = useCallback((values) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams({
      salary: String(Number(values.salary) || 0),
      bills: String(Number(values.bills) || 0),
      savings: String(Number(values.savings) || 0),
      days: String(Number(values.days) || 0),
    });
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(window.history.state, "", next);
  }, []);

  const initialValues = {
    salary: search.salary ?? String(site.sampleFigures.salary),
    bills: search.bills ?? String(site.sampleFigures.bills),
    savings: search.savings ?? String(site.sampleFigures.savings),
    days: search.days ?? String(site.sampleFigures.days),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            Core Methodology · Daily Allowance
          </span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight">
            Safe-to-Spend Calculator
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Take your monthly in-hand salary, ring-fence rent and fixed bills, subtract your savings target, and divide what is left across the days until next payday.
          </p>
        </div>

        <div className="mt-8">
          <CalculatorComponent initialValues={initialValues} onSync={sync} />
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Frequently Asked Questions on Daily Spending
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
