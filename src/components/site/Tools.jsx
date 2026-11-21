const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ list:async()=>[], filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } }, analytics: { track: () => {} } };

import { useState } from "react";
import { ReceiptText, TrendingUp, CreditCard } from "lucide-react";

import { site } from "@/config/site";
import InteractiveTaxCalculator from "@/components/tax/InteractiveTaxCalculator";
import InvestTool from "@/components/site/InvestTool";
import CreditScoreTool from "@/components/site/CreditScoreTool";

const TABS = [
  { value: "tax", label: "Tax planner (FY 2026-27)", icon: ReceiptText },
  { value: "invest", label: "Invest", icon: TrendingUp },
  { value: "credit", label: "Credit score", icon: CreditCard },
];

export default function Tools() {
  const [activeTab, setActiveTab] = useState("tax");

  return (
    <section id="tools" aria-labelledby="tools-heading" className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Free tools</p>
        <h2 id="tools-heading" className="mt-3 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-tight tracking-tight">
          The things nobody explains in your first job.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          No signup, no email wall. Everything here runs on the numbers you type and nothing else. Last reviewed:{" "}
          {site.asOf.tools}. Educational only, not financial or tax advice.
        </p>
      </div>

      <div className="mt-10">
        <div
          role="tablist"
          aria-label="Free tools navigation"
          className="inline-flex h-auto w-full flex-wrap justify-start gap-1 rounded-full border border-border bg-card p-1.5 sm:w-auto"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.value);
                  try {
                    db?.analytics?.track?.({ eventName: "tool_tab", properties: { tab: tab.value } });
                  } catch {
                    /* ignore */
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card/60 p-5 sm:p-8">
          {activeTab === "tax" && <InteractiveTaxCalculator />}
          {activeTab === "invest" && <InvestTool />}
          {activeTab === "credit" && <CreditScoreTool />}
        </div>
      </div>
    </section>
  );
}