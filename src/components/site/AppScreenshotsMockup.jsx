import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Battery,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Flame,
  LayoutDashboard,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
} from "lucide-react";

export default function AppScreenshotsMockup() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <section id="preview" aria-labelledby="preview-heading" className="border-b border-border bg-secondary/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Real Web App Screens
          </p>
          <h2
            id="preview-heading"
            className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight"
          >
            Built for your thumb. Runs right in your browser.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            No app store download required to start. Open in Safari or Chrome, log your numbers, and see your daily safe-to-spend figure in seconds.
          </p>

          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-border bg-card p-1.5 shadow-sm">
            {[
              { id: "dashboard", label: "Daily Safe-to-Spend", icon: LayoutDashboard },
              { id: "budget", label: "Budget Planner", icon: Wallet },
              { id: "sip", label: "SIP & Wealth", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center">
          {/* Phone Frame */}
          <div className="relative w-full max-w-[340px] rounded-[3rem] border-[6px] border-ink/80 bg-ink p-3 shadow-2xl ring-1 ring-border">
            {/* Speaker / Camera Notch */}
            <div className="absolute left-1/2 top-4 z-20 h-4 w-28 -translate-x-1/2 rounded-full bg-ink flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-ink/40 mr-2" />
              <div className="h-1.5 w-8 rounded-full bg-ink/40" />
            </div>

            {/* Inner Screen */}
            <div className="relative min-h-[580px] overflow-hidden rounded-[2.4rem] bg-background text-foreground shadow-inner">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-muted-foreground">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3 w-3" />
                  <Battery className="h-3 w-3" />
                </div>
              </div>

              {/* TAB 1: DASHBOARD SCREEN */}
              {activeTab === "dashboard" && (
                <div className="p-4 pt-3 transition-opacity duration-300">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Salary Cycle: 1 Nov – 30 Nov
                      </p>
                      <p className="text-xs font-semibold">Hi Priya, here is today</p>
                    </div>
                    <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[10px] font-medium text-positive">
                      21 days left
                    </span>
                  </div>

                  {/* Safe to Spend Card */}
                  <div className="mt-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-md">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-primary-foreground/75">
                      Safe to spend today
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold tracking-tight">₹900</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-primary-foreground/85">
                      Rent, bills &amp; savings are already reserved. This is yours to spend freely today.
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-primary-foreground/10 p-2 text-center text-[10px]">
                      <div>
                        <span className="block text-primary-foreground/70">Rent</span>
                        <span className="font-semibold">₹9,000</span>
                      </div>
                      <div>
                        <span className="block text-primary-foreground/70">Bills</span>
                        <span className="font-semibold">₹3,000</span>
                      </div>
                      <div>
                        <span className="block text-primary-foreground/70">Savings</span>
                        <span className="font-semibold">₹6,000</span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Quick Spends */}
                  <div className="mt-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Quick Log Spends
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium">
                        <Coffee className="h-3 w-3 text-ink/70" /> Chai ₹40
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium">
                        <Utensils className="h-3 w-3 text-ink/70" /> Auto ₹85
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium">
                        <Flame className="h-3 w-3 text-ink/70" /> Swiggy ₹320
                      </span>
                    </div>
                  </div>

                  {/* Today's Logged Spends */}
                  <div className="mt-3.5 space-y-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Recorded today
                    </p>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs">
                      <div>
                        <p className="font-medium">Chai &amp; biscuits</p>
                        <p className="text-[10px] text-muted-foreground">11:15 AM · Food</p>
                      </div>
                      <span className="font-semibold text-foreground">-₹40</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs">
                      <div>
                        <p className="font-medium">Auto to metro</p>
                        <p className="text-[10px] text-muted-foreground">09:30 AM · Transport</p>
                      </div>
                      <span className="font-semibold text-foreground">-₹85</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUDGET PLANNER SCREEN */}
              {activeTab === "budget" && (
                <div className="p-4 pt-3 transition-opacity duration-300">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        November Budget
                      </p>
                      <p className="text-xs font-semibold">Category Ceilings</p>
                    </div>
                    <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-medium border border-border">
                      ₹12,400 / ₹18,000
                    </span>
                  </div>

                  <div className="mt-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
                    <p className="text-[11px] font-medium text-foreground">
                      Monthly Spending Limits
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Get a calm warning at 80% so you never run out on the 20th.
                    </p>
                  </div>

                  <div className="mt-3 space-y-3">
                    {/* Category 1 */}
                    <div className="rounded-xl border border-border bg-card p-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Food &amp; Groceries</span>
                        <span className="font-semibold tabular-nums">₹6,400 / ₹8,000</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{ width: "80%" }} />
                      </div>
                      <p className="mt-1 text-[10px] text-warning font-medium">
                        At 80% ceiling · ₹1,600 left for 10 days
                      </p>
                    </div>

                    {/* Category 2 */}
                    <div className="rounded-xl border border-border bg-card p-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Cabs &amp; Metro</span>
                        <span className="font-semibold tabular-nums">₹1,800 / ₹3,500</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-positive rounded-full" style={{ width: "51%" }} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        On track · ₹1,700 remaining
                      </p>
                    </div>

                    {/* Category 3 */}
                    <div className="rounded-xl border border-destructive/30 bg-destructive-soft/30 p-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Weekend Outings</span>
                        <span className="font-semibold text-destructive tabular-nums">₹4,200 / ₹4,000</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-destructive rounded-full" style={{ width: "100%" }} />
                      </div>
                      <p className="mt-1 text-[10px] text-destructive font-medium">
                        ₹200 over budget · Daily number adjusted
                      </p>
                    </div>

                    {/* Category 4 */}
                    <div className="rounded-xl border border-border bg-card p-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Shopping &amp; Gear</span>
                        <span className="font-semibold tabular-nums">₹0 / ₹2,500</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-positive rounded-full" style={{ width: "0%" }} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Full ₹2,500 available
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SIP & INVESTMENTS SCREEN */}
              {activeTab === "sip" && (
                <div className="p-4 pt-3 transition-opacity duration-300">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        First SIP Planner
                      </p>
                      <p className="text-xs font-semibold">10-Year Compounding</p>
                    </div>
                    <span className="rounded-full bg-positive-soft px-2 py-0.5 text-[10px] font-medium text-positive">
                      12% p.a.
                    </span>
                  </div>

                  {/* Summary Card */}
                  <div className="mt-3 rounded-2xl bg-secondary/70 p-3.5 border border-border">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Monthly SIP: ₹5,000 + 10% annual step-up
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-accent">₹17,47,482</p>
                    <p className="text-[10px] text-muted-foreground">Expected value after 10 years</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2 text-[11px]">
                      <div>
                        <span className="block text-[10px] text-muted-foreground">Total Invested</span>
                        <span className="font-semibold">₹9,56,245</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-muted-foreground">Wealth Gained</span>
                        <span className="font-semibold text-positive">₹7,91,237</span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Before your first SIP:
                    </p>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-positive shrink-0" />
                      <span>Emergency fund: ₹54,000 reserved</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-positive shrink-0" />
                      <span>Zero high-interest credit card debt</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                      <span>Direct index plan selected (lowest cost)</span>
                    </div>
                  </div>

                  <p className="mt-3 text-[9px] leading-tight text-muted-foreground text-center">
                    Educational projection. Mutual funds are subject to market risks.
                  </p>
                </div>
              )}

              {/* Bottom Nav Simulation */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-border bg-card/95 py-2.5 backdrop-blur-sm">
                <div className={`flex flex-col items-center gap-0.5 ${activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"}`}>
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-[9px] font-medium">Daily</span>
                </div>
                <div className={`flex flex-col items-center gap-0.5 ${activeTab === "budget" ? "text-primary" : "text-muted-foreground"}`}>
                  <Wallet className="h-4 w-4" />
                  <span className="text-[9px] font-medium">Budget</span>
                </div>
                <div className={`flex flex-col items-center gap-0.5 ${activeTab === "sip" ? "text-primary" : "text-muted-foreground"}`}>
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[9px] font-medium">SIP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Under phone CTA */}
          <div className="mt-8 text-center">
            <Link
              to="/register"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              Start free in your browser
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>✓ Instant access</span>
              <span>✓ No credit card</span>
              <span>✓ Zero bank login required</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Looking for a live walkthrough?{" "}
              <a href="#book" className="font-medium underline underline-offset-2 hover:text-foreground">
                Book a 15-min demo
              </a>
              {" · "}
              Android user?{" "}
              <a href="#waitlist" className="font-medium underline underline-offset-2 hover:text-foreground">
                Join the Android waitlist
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
