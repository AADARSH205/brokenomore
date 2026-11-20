import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Calculator, Landmark, ShieldCheck } from "lucide-react";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import InteractiveTaxCalculator from "@/components/tax/InteractiveTaxCalculator";
import { site } from "@/config/site";

const FAQS = [
  {
    q: "Is salary up to ₹12.75 Lakh completely tax-free under the New Regime in FY 2026-27?",
    a: "Yes. Salaried individuals receive a standard deduction of ₹75,000, bringing taxable income down to ₹12,00,000. Under Section 87A, taxable income up to ₹12,00,000 receives a full tax rebate of up to ₹60,000, resulting in zero payable tax.",
  },
  {
    q: "What are the 7 income tax slabs in the New Tax Regime for FY 2026-27?",
    a: "The slabs are: ₹0 to ₹4L (Nil), ₹4L to ₹8L (5%), ₹8L to ₹12L (10%), ₹12L to ₹16L (15%), ₹16L to ₹20L (20%), ₹20L to ₹24L (25%), and above ₹24L (30%). Surcharge and 4% cess apply where applicable.",
  },
  {
    q: "Can I claim Section 124(3) / 80CCD(1B) NPS under both regimes?",
    a: "No. Voluntary employee NPS contributions under Section 124(3) (Direct Tax Code) / Section 80CCD(1B) (up to ₹50,000) are only deductible under the Old Regime. Employer NPS under Section 80CCD(2) is available in both regimes.",
  },
  {
    q: "When should I choose the Old Tax Regime over the New Regime?",
    a: "The Old Regime generally wins only if your total deductions (HRA, 80C, 80D, home loan interest, and voluntary NPS) exceed ₹3.75 Lakhs to ₹4.25 Lakhs per year. For most first-job earners without high rent receipts or home loans, the New Regime saves more money with zero paperwork.",
  },
];

export const Route = createFileRoute("/old-vs-new-tax-regime-calculator")({
  head: () => {
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Old vs New Tax Regime Calculator FY 2026-27 — BrokeNoMore",
        url: `${site.url}/old-vs-new-tax-regime-calculator`,
        applicationCategory: "FinanceApplication",
        description: "Interactive tax calculator comparing Old vs New income tax regimes for FY 2026-27 (AY 2027-28) in India with 7 slabs and Section 87A rebate.",
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
        { title: "Old vs New Tax Regime Calculator FY 2026-27 (AY 2027-28) — BrokeNoMore" },
        {
          name: "description",
          content:
            "Compare Old vs New Tax Regime for FY 2026-27. Features 7 slabs, ₹75,000 standard deduction, ₹60,000 Section 87A rebate, and Section 124(3) NPS deduction.",
        },
        { property: "og:title", content: "Old vs New Tax Regime Calculator FY 2026-27 — BrokeNoMore" },
        {
          property: "og:description",
          content:
            "Find out which regime saves you more money in 30 seconds. Detailed breakdown of deductions, HRA, NPS, and marginal relief.",
        },
        { property: "og:url", content: `${site.url}/old-vs-new-tax-regime-calculator` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${site.url}/old-vs-new-tax-regime-calculator` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: TaxCalculatorPage,
});

function TaxCalculatorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            Income Tax India · FY 2026-27
          </span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight">
            Old vs New Tax Regime Calculator
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            See your exact tax liability under both tax regimes side by side. Includes 7 slabs, ₹75,000 standard deduction, Section 87A rebate up to ₹12L, and Section 124(3) NPS.
          </p>
        </div>

        <div className="mt-8">
          <InteractiveTaxCalculator defaultTab="deductions-help" />
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Frequently Asked Questions: FY 2026-27 Income Tax
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
