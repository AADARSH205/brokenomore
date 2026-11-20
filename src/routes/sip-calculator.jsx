import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, Sparkles, TrendingUp } from "lucide-react";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import SipCalculator from "@/components/sip/SipCalculator";
import BeforeSipChecklist from "@/components/sip/BeforeSipChecklist";
import FirstSipGuide from "@/components/sip/FirstSipGuide";
import { site } from "@/config/site";

const FAQS = [
  {
    q: "What is an annual step-up SIP and why does it matter?",
    a: "An annual step-up SIP automatically increases your monthly investment by a set percentage (e.g., 10%) each year to match your salary increments. Stepping up by 10% each year can nearly double your final 20-year wealth compared to a flat SIP.",
  },
  {
    q: "What is the Reverse SIP Calculator mode?",
    a: "Instead of asking 'how much will ₹5,000 grow to?', the reverse mode lets you enter your goal (e.g., ₹25 Lakhs in 10 years) and calculates the exact starting monthly SIP amount needed to reach it.",
  },
  {
    q: "Why should I pick Direct Plans over Regular Plans?",
    a: "Direct plans have zero broker commission, saving 1% to 1.5% in expense ratio every single year. Compounded over 20 years, that 1% difference translates to ₹15 to ₹30 Lakhs in additional wealth in your account.",
  },
  {
    q: "Should I start a SIP if I still have credit card debt?",
    a: "No. Credit cards charge 36% to 42% annual interest. Paying off high-interest debt and setting aside a 3-month emergency fund is the mandatory prerequisite before starting an equity SIP.",
  },
];

export const Route = createFileRoute("/sip-calculator")({
  head: () => {
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "SIP Calculator with Step-Up and Reverse Mode — BrokeNoMore",
        url: `${site.url}/sip-calculator`,
        applicationCategory: "FinanceApplication",
        description: "Calculate mutual fund SIP growth with 8%, 10%, 12% scenarios, annual step-up %, and inflation-adjusted purchasing power.",
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
        { title: "SIP Calculator with Step-Up & Reverse Mode — BrokeNoMore" },
        {
          name: "description",
          content:
            "Plan your mutual fund SIP with 8%, 10%, 12% return scenarios, annual step-up %, inflation adjustment, and reverse goal-based SIP calculation.",
        },
        { property: "og:title", content: "SIP Calculator with Step-Up & Reverse Mode — BrokeNoMore" },
        {
          property: "og:description",
          content:
            "Calculate future wealth and required monthly investment. Includes 3-to-6 month emergency fund checklist and 5-step beginner guide.",
        },
        { property: "og:url", content: `${site.url}/sip-calculator` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `${site.url}/sip-calculator` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: SipCalculatorPage,
});

function SipCalculatorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-ink">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Compounding & Wealth · India
          </span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight">
            SIP Calculator with Step-Up & Reverse Mode
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            See the math of compound growth with realistic 8%, 10%, and 12% return scenarios. Adjust for 6% inflation or toggle Reverse Mode to find the monthly SIP needed for your target goal.
          </p>
        </div>

        <div className="mt-8 space-y-8">
          <SipCalculator />
          <BeforeSipChecklist isInteractive={true} monthlyExpenses={25000} />
          <FirstSipGuide />
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Frequently Asked Questions about SIP & Mutual Funds
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
