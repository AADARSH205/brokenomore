import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock, Globe, Shield, Smartphone } from "lucide-react";

const LIVE_FEATURES = [
  {
    title: "Safe to spend today calculation",
    desc: "Reserves rent, utility bills, and monthly savings on payday, then divides what's left over the days remaining.",
  },
  {
    title: "1-Tap expense tracking",
    desc: "Log an auto ride or chai in 5 seconds. Today's number updates instantly so you always know where you stand.",
  },
  {
    title: "Monthly budget ceilings",
    desc: "Set category limits for dining, cabs, and shopping with gentle warnings at 80% capacity before you overspend.",
  },
  {
    title: "FY 2026-27 Indian Tax Planner",
    desc: "Compare Old vs New tax regimes with standard deduction, Section 87A rebate, and marginal relief calculation.",
  },
  {
    title: "Interactive SIP & compounding tools",
    desc: "Forecast your first mutual fund SIP with step-up rates and 8%, 10%, and 12% illustrative scenarios.",
  },
  {
    title: "Complete manual privacy",
    desc: "Zero bank credentials required. 1-click JSON export and instant total data deletion available anytime.",
  },
];

const COMING_SOON_FEATURES = [
  {
    title: "Android app coming soon",
    desc: "A native Android experience with home screen widgets and optional daily morning reminder notifications.",
    waitlist: true,
  },
  {
    title: "Optional Account Aggregator bank sync",
    desc: "Strictly opt-in, read-only bank statement sync via RBI-licensed Account Aggregators for automated tracking.",
  },
  {
    title: "Shared household & flatmate budgets",
    desc: "Coordinate grocery pools and shared apartment expenses with roommates without manual spreadsheet math.",
  },
  {
    title: "Local SMS expense parsing (Android only)",
    desc: "On-device parsing of transaction SMS notifications with explicit user permission, without server upload.",
  },
];

export default function WhatsLiveToday() {
  return (
    <section id="live-status" aria-labelledby="live-heading" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Platform status &amp; transparency
        </p>
        <h2
          id="live-heading"
          className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight text-foreground"
        >
          What's live today vs. what's coming.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          BrokeNoMore is a live web app. It runs directly in your browser on phone, tablet, or desktop today. We do not describe any feature as live unless it genuinely works.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* CARD 1: LIVE TODAY */}
        <div className="rounded-3xl border border-positive/30 bg-card p-6 shadow-soft sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-positive-soft text-positive">
                  <Globe className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">Live Today (Web App)</h3>
              </div>
              <span className="rounded-full bg-positive-soft px-3 py-1 text-xs font-medium text-positive">
                Live in browser
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Works right now in Chrome, Safari, Firefox, or Edge. No app store installation required.
            </p>

            <ul className="mt-6 space-y-4">
              {LIVE_FEATURES.map((item) => (
                <li key={item.title} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/register"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start free in your browser
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* CARD 2: COMING SOON */}
        <div className="rounded-3xl border border-border bg-secondary/30 p-6 shadow-soft sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Clock className="h-4 w-4" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">What's Coming</h3>
              </div>
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                Roadmap
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Features currently in development. We will only mark them live after rigorous testing.
            </p>

            <ul className="mt-6 space-y-4">
              {COMING_SOON_FEATURES.map((item) => (
                <li key={item.title} className="flex items-start gap-3 text-sm">
                  <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      {item.waitlist && (
                        <a
                          href="#waitlist"
                          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        >
                          Join waitlist
                        </a>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-2xl border border-border/70 bg-card p-4 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Shield className="h-4 w-4 text-positive shrink-0" />
              <span>Zero Bank Connection Contradictions</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              BrokeNoMore is 100% manual entry today: zero bank logins, zero bank connections, and zero OTPs. Your money and credentials never leave your bank. Optional read-only Account Aggregator sync is planned for a future release and will require explicit opt-in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
