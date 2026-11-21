const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Link } from "@tanstack/react-router";
import { ArrowRight, BellRing, Calculator, Globe, Landmark, PiggyBank, Receipt, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

import PhoneDemo from "@/components/site/PhoneDemo";
import { useLanguage } from "@/lib/i18n";
import { trackSignupStarted } from "@/lib/analytics";

const BENEFITS = [
  {
    icon: Wallet,
    title: "Manage your salary",
    body: "See what the month really leaves you, the day it lands.",
    href: "#calculator",
  },
  {
    icon: Receipt,
    title: "Track your expenses",
    body: "Log a spend in seconds and watch the daily number move.",
    href: "#how-it-works",
  },
  {
    icon: PiggyBank,
    title: "Save every month",
    body: "Savings come out first, so they are never what is left over.",
    href: "#how-it-works",
  },
  {
    icon: Landmark,
    title: "Plan your income tax",
    body: "Old regime or new, compared with your own figures.",
    href: "#tools",
  },
  {
    icon: TrendingUp,
    title: "Start a SIP",
    body: "See what a small monthly amount could grow into.",
    href: "#tools",
  },
];

const STRIP = [
  { icon: Globe, label: "Live web app — works instantly in your browser" },
  { icon: ShieldCheck, label: "Zero bank login: 100% manual entry for complete privacy" },
  { icon: BellRing, label: "One safe number, every morning" },
  { icon: Calculator, label: "Free tax, SIP and budget tools" },
];

export default function Hero() {
  const { t, language } = useLanguage();

  return (
    <section className="hero-scene" aria-labelledby="hero-heading">
      <div className="hero-ripple" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-14 pt-14 sm:pt-20 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-cream/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ink/75">
              {t("hero_badge")}
            </p>
            <h1
              id="hero-heading"
              className="mt-5 max-w-[15em] font-display text-[clamp(2.1rem,6.2vw,4rem)] font-semibold leading-[1.04] tracking-[-0.015em] text-ink"
            >
              {language === "hi" ? (
                <>
                  Ek Safe Number Roz Subah.
                  <span className="block text-ink/80">Month-End Me Kabhi Broke Mat Ho.</span>
                </>
              ) : (
                <>
                  Your Salary. Your Budget.
                  <span className="block text-ink/80">Your Financial Future.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink/80 sm:text-lg">
              {t("hero_sub")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                search={{ returnTo: "/dashboard" }}
                onClick={() => {
                  trackSignupStarted("hero");
                  try { db?.analytics?.track?.({ eventName: "hero_cta_start_free" }); } catch { /* ignore */ }
                }}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink px-7 text-center text-[15px] font-medium text-cream shadow-md transition-colors hover:bg-ink/90"
              >
                {t("hero_primary_cta")}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
              <a
                href="#calculator"
                onClick={() => { try { db?.analytics?.track?.({ eventName: "hero_cta_calculator" }); } catch { /* ignore */ } }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-ink px-7 text-[15px] font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                {t("hero_secondary_cta")}
              </a>
            </div>

            <p className="mt-4 text-[13px] text-ink/70">
              Want a walkthrough first?{" "}
              <a href="#book" className="font-medium underline underline-offset-2">
                Book a 15-min demo
              </a>
              {" · "}
              Android user?{" "}
              <a href="#waitlist" className="font-medium underline underline-offset-2">
                Join Android waitlist
              </a>
              .
            </p>
          </div>

          <div className="rise" style={{ animationDelay: "120ms" }}>
            <PhoneDemo />
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li key={benefit.title}>
                <a
                  href={benefit.href}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-ink/15 bg-cream/60 p-4 transition-colors hover:border-ink/40 hover:bg-cream/85"
                >
                  <Icon className="h-5 w-5 text-ink/70" aria-hidden="true" />
                  <p className="text-sm font-semibold text-ink">{benefit.title}</p>
                  <p className="text-[12px] leading-relaxed text-ink/70">{benefit.body}</p>
                </a>
              </li>
            );
          })}
        </ul>

        <ul className="mt-10 grid grid-cols-1 gap-4 border-t border-cream/25 pt-8 text-cream sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STRIP.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex items-start gap-2.5 text-[13px] leading-snug text-cream/90">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cream" aria-hidden="true" />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
