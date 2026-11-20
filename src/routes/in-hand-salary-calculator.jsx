import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, CheckCircle2, HelpCircle, Landmark, ShieldCheck } from "lucide-react";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import InteractiveTaxCalculator from "@/components/tax/InteractiveTaxCalculator";
import { site } from "@/config/site";

const FAQS = [
  {
    q: "What is the difference between CTC and In-Hand Salary in India?",
    a: "Cost to Company (CTC) is the total amount an employer spends on you, including employee & employer EPF contributions, gratuity, and insurance. In-hand (take-home) salary is the cash actually credited to your bank account after deducting Employee PF, Professional Tax, and Income Tax TDS.",
  },
  {
    q: "How much EPF is deducted from my monthly salary?",
    a: "Usually 12% of your Basic Salary is deducted toward the Employee Provident Fund (EPF), matched by your employer's equal contribution (3.67% to EPF + 8.33% to EPS).",
  },
  {
    q: "How does the FY 2026-27 New Tax Regime affect in-hand salary?",
    a: "Under the FY 2026-27 New Regime, gross salary up to ₹12.75 Lakhs incurs zero income tax (due to the ₹75,000 standard deduction and ₹60,000 Section 87A rebate). This significantly increases take-home pay for early-career professionals.",
  },
  {
    q: "Can I connect my in-hand salary to my daily safe-to-spend allowance?",
    a: "Yes! BrokeNoMore takes your monthly take-home salary, reserves your rent, fixed bills, and savings target on payday, and divides what is left into one calm daily spending number.",
  },
];

export const Route = createFileRoute("/in-hand-salary-calculator")({
  head: () => {
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "In-Hand Salary Calculator India — BrokeNoMore",
        url: `${site.url}/in-hand-salary-calculator`,
        applicationCategory: "FinanceApplication",
        description: "Calculate your monthly in-hand take-home salary from your annual CTC in India. Includes PF, Professional Tax, and FY 2026-27 tax TDS.",
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
        { title: "In-Hand Salary Calculator (CTC to Monthly Take-Home India) — BrokeNoMore" },
        {
          name: "description",
          content:
            "Accurately calculate your monthly in-hand take-home salary from annual CTC in India. Factors in PF, professional tax, and FY 2026-27 income tax TDS.",
        },
        { property: "og:title", content: "In-Hand Salary Calculator (CTC to Monthly Take-Home) — BrokeNoMore" },
        {
          property: "og:description",
          content:
            "Convert CTC to real bank credit. Calculate take-home salary with standard deduction of ₹75,000 and 87A tax rebate for FY 2026-27.",
        },
        { property: "og:url", content: `${site.url}/in-hand-salary-calculator` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${site.url}/in-hand-salary-calculator` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: InHandSalaryPage,
});

function InHandSalaryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <Calculator className="h-3.5 w-3.5 text-primary" />
            Salary Tools · India
          </span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight">
            In-Hand Salary Calculator
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Convert your annual Cost-to-Company (CTC) into the actual cash credited to your bank account every month. Updated for FY 2026-27 tax rules.
          </p>
        </div>

        <div className="mt-8">
          <InteractiveTaxCalculator defaultTab="in-hand" />
        </div>

        {/* SEO FAQ SECTION */}
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Frequently Asked Questions on In-Hand Salary
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
