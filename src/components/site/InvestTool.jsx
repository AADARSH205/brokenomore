import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckSquare, Sparkles, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SipCalculator from "@/components/sip/SipCalculator";
import BeforeSipChecklist from "@/components/sip/BeforeSipChecklist";
import FirstSipGuide from "@/components/sip/FirstSipGuide";

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-full border border-border bg-card p-1.5 sm:w-auto">
          <TabsTrigger
            value="calculator"
            className="gap-2 rounded-full px-4 py-2 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            SIP Calculator & Reverse Mode
          </TabsTrigger>
          <TabsTrigger
            value="checklist"
            className="gap-2 rounded-full px-4 py-2 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Before Your First SIP Checklist
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="gap-2 rounded-full px-4 py-2 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BookOpen className="h-3.5 w-3.5" />
            First SIP in 5 Steps Guide
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="calculator" className="mt-0">
            <SipCalculator />
          </TabsContent>

          <TabsContent value="checklist" className="mt-0">
            <BeforeSipChecklist isInteractive={true} monthlyExpenses={25000} />
          </TabsContent>

          <TabsContent value="guide" className="mt-0">
            <FirstSipGuide />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
