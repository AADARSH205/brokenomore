import { createFileRoute } from "@tanstack/react-router";
import { Landmark, ShieldCheck } from "lucide-react";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import HraCalculator from "@/components/tax/HraCalculator";
import { site } from "@/config/site";

const FAQS = [
  {
    q: "How is House Rent Allowance (HRA) exemption calculated in India?",
    a: "Under Section 10(13A) Rule 2A, the exempt HRA is the minimum of three values: (1) Actual HRA received, (2) 50% of Basic Salary for metro cities (Delhi, Mumbai, Kolkata, Chennai) or 40% for non-metros, and (3) Rent paid minus 10% of Basic Salary.",
  },
  {
    q: "Is HRA exemption available under the New Tax Regime in FY 2026-27?",
    a: "No. The New Tax Regime does not allow HRA exemption under Section 10(13A). However, the New Regime provides a standard deduction of ₹75,000 and lower tax slabs, making income up to ₹12.75L zero tax.",
  },
  {
    q: "Which cities are considered Metro cities for 50% HRA exemption?",
    a: "According to the Income Tax Department of India, only four cities qualify for 50% basic salary exemption: New Delhi, Mumbai, Kolkata, and Chennai. All other cities (including Bengaluru, Hyderabad, and Pune) are categorized as non-metro (40%).",
  },
  {
    q: "Do I need landlord's PAN to claim HRA?",
    a: "If your annual rent paid exceeds ₹1,00,000 (more than ₹8,333 per month), providing your landlord's PAN to your employer is mandatory to claim HRA exemption.",
  },
];

export const Route = createFileRoute("/hra-calculator")({
  head: () => {
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "HRA Exemption Calculator India — BrokeNoMore",
        url: `${site.url}/hra-calculator`,
        applicationCategory: "FinanceApplication",
        description: "Calculate your Section 10(13A) House Rent Allowance tax exemption based on basic salary, HRA received, and rent paid in India.",
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
        { title: "HRA Exemption Calculator (House Rent Allowance Section 10(13A)) — BrokeNoMore" },
        {
          name: "description",
          content:
            "Calculate your Section 10(13A) House Rent Allowance (HRA) exemption. Compares actual HRA, 50%/40% of basic salary, and rent paid minus 10% of basic.",
        },
        { property: "og:title", content: "HRA Exemption Calculator (Section 10(13A)) — BrokeNoMore" },
        {
          property: "og:description",
          content:
            "Find out how much HRA is tax-free in 10 seconds. Compares metro (50%) and non-metro (40%) rules for salaried employees.",
        },
        { property: "og:url", content: `${site.url}/hra-calculator` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${site.url}/hra-calculator` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: HraCalculatorPage,
});

function HraCalculatorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            Tax Exemptions · Section 10(13A)
          </span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight">
            HRA Exemption Calculator
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Quickly determine the exact tax-free and taxable portions of your House Rent Allowance under Rule 2A of the Indian Income Tax Act.
          </p>
        </div>

        <div className="mt-8">
          <HraCalculator />
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Frequently Asked Questions on HRA Exemption
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
