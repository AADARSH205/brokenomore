const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import AppScreenshotsMockup from "@/components/site/AppScreenshotsMockup";
import ProductSuite from "@/components/site/ProductSuite";
import HowItWorks from "@/components/site/HowItWorks";
import WhatsLiveToday from "@/components/site/WhatsLiveToday";
import Calculator from "@/components/site/Calculator";
import WhyDaily from "@/components/site/WhyDaily";
import Tools from "@/components/site/Tools";
import FounderNote from "@/components/site/FounderNote";
import Pricing from "@/components/site/Pricing";
import Faq from "@/components/site/Faq";
import BookingCta from "@/components/site/BookingCta";
import WaitlistSection from "@/components/site/WaitlistSection";
import Footer from "@/components/site/Footer";
import { site, faqs } from "@/config/site";
import { computeDailyNumber, formatINR } from "@/lib/money";

export const Route = createFileRoute("/")({
  validateSearch: (search) => ({
    salary: search.salary,
    bills: search.bills,
    savings: search.savings,
    days: search.days,
  }),
  head: () => {
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.name,
        url: site.url,
        description: site.description,
        email: site.contactEmail,
        areaServed: "IN",
        sameAs: site.socials.map((social) => social.href),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "BrokeNoMore Web App",
        url: site.url,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, iOS, Android",
        description: site.description,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
    return {
      meta: [
        { title: "BrokeNoMore — One safe-to-spend number every morning" },
        {
          name: "description",
          content:
            "Free financial tools for India's first-job salaried professionals: daily safe-to-spend number, expense tracker, tax calculator, SIP planner, credit score guide, and more.",
        },
        { property: "og:title", content: "BrokeNoMore — One safe-to-spend number every morning" },
        {
          property: "og:description",
          content:
            "Free financial tools for India's first-job salaried professionals. Calculate your daily safe-to-spend number, plan taxes (80D, 80C), track investments, and build credit.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: site.url },
        { property: "og:locale", content: "en_IN" },
        {
          property: "og:image",
          content:
            "https://media.db.com/images/public/6b00896e166337dc3b5ed86e/e00d37296_generated_image.png",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "BrokeNoMore — One safe-to-spend number every morning" },
        {
          name: "twitter:description",
          content: "Calculate save-to-spend numbers, tax savings, SIP investments, credit scores, and emergency funds. Free financial tools for India's first-job professionals.",
        },
        {
          name: "twitter:image",
          content:
            "https://media.db.com/images/public/6b00896e166337dc3b5ed86e/e00d37296_generated_image.png",
        },
      ],
      links: [{ rel: "canonical", href: site.url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: Home,
});

function Home() {
  const search = Route.useSearch();

  // Keep the calculator's inputs in the address bar so a result can be shared or bookmarked.
  const sync = useCallback((values) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams({
      salary: String(Number(values.salary) || 0),
      bills: String(Number(values.bills) || 0),
      savings: String(Number(values.savings) || 0),
      days: String(Number(values.days) || 0),
    });
    const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, []);

  const initialValues = {
    salary: search.salary ?? String(site.sampleFigures.salary),
    bills: search.bills ?? String(site.sampleFigures.bills),
    savings: search.savings ?? String(site.sampleFigures.savings),
    days: search.days ?? String(site.sampleFigures.days),
  };

  const preview = computeDailyNumber(initialValues);

  return (
    <div id="top" className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <AppScreenshotsMockup />
        <ProductSuite />
        <HowItWorks />
        <WhatsLiveToday />

        <section id="calculator" aria-labelledby="calc-heading" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              The daily number
            </p>
            <h2
              id="calc-heading"
              className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight"
            >
              Find your number in about twenty seconds.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Same maths as the web app: salary minus bills minus savings, divided by the days left. The hero
              above uses {formatINR(site.sampleFigures.salary)} in hand and comes out at{" "}
              {formatINR(computeDailyNumber(site.sampleFigures).daily)} a day.
              {preview.status === "ok" && search.salary ? " Your link is already filled in." : ""}
            </p>
          </div>
          <div className="mt-10">
            <Calculator
              key={`${initialValues.salary}-${initialValues.bills}-${initialValues.savings}-${initialValues.days}`}
              initialValues={initialValues}
              onSync={sync}
            />
          </div>
        </section>

        <WhyDaily />
        <Tools />
        <FounderNote />
        <Pricing />
        <Faq />
        <BookingCta />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
}
