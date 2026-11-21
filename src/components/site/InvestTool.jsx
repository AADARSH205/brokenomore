import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckSquare, TrendingUp } from "lucide-react";
import SipCalculator from "@/components/sip/SipCalculator";
import BeforeSipChecklist from "@/components/sip/BeforeSipChecklist";
import FirstSipGuide from "@/components/sip/FirstSipGuide";

const SUB_TABS = [
  { value: "calculator", label: "SIP Calculator & Reverse Mode", icon: TrendingUp },
  { value: "checklist", label: "Before Your First SIP Checklist", icon: CheckSquare },
  { value: "guide", label: "First SIP in 5 Steps Guide", icon: BookOpen },
];

export default function InvestTool() {
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Your first SIP toolkit</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Clear arithmetic, a 3-point safety checklist, and a 5-step roadmap. No mutual fund sales or commissions.
          </p>
        </div>
        <Link
          to="/register"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start free
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="w-full">
        <div
          role="tablist"
          aria-label="SIP toolkit navigation"
          className="inline-flex h-auto w-full flex-wrap justify-start gap-1 rounded-full border border-border bg-card p-1.5 sm:w-auto"
        >
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === "calculator" && <SipCalculator />}
          {activeTab === "checklist" && <BeforeSipChecklist isInteractive={true} monthlyExpenses={25000} />}
          {activeTab === "guide" && <FirstSipGuide />}
        </div>
      </div>
    </div>
  );
}
