import { AlertCircle, CheckCircle2, ChevronRight, FileText, Info, Percent, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function FirstSipGuide() {
  const steps = [
    {
      step: 1,
      title: "Complete One-Time Central KYC",
      description: "You only need to complete KYC once in India to invest across all mutual funds.",
      details: "Have your PAN card, Aadhaar card (with mobile number linked for OTP), and a cancelled cheque or bank statement ready. Most direct platforms verify this digitally within 15 to 30 minutes at zero charge.",
    },
    {
      step: 2,
      title: "Pick a Direct Platform",
      description: "Never invest through traditional agents or regular platforms that take commissions from your profits.",
      details: "Use reputable direct mutual fund platforms such as Zerodha Coin, Groww, Kuvera, MF Central (official CAMS/KFintech platform), or directly on the fund house website (AMC direct). Look for 'Zero commission direct mutual funds'.",
    },
    {
      step: 3,
      title: "Choose a Fund Category (Direct - Growth)",
      description: "Pick an all-weather category suited for long-term compounding. Do not chase last year's top performer.",
      categories: [
        {
          name: "Nifty 50 Index Fund",
          badge: "Best for First SIP",
          desc: "Invests in India's top 50 blue-chip companies proportionally. No fund manager bias, ultra-low expense ratio (~0.1% to 0.2%). You grow as India's biggest companies grow.",
        },
        {
          name: "Flexi-Cap Fund",
          badge: "Diversified Equity",
          desc: "The fund manager can freely invest across large, mid, and small-cap companies depending on market opportunities.",
        },
        {
          name: "ELSS (Tax Saver)",
          badge: "Old Regime 80C",
          desc: "Equity fund with a mandatory 3-year lock-in (shortest among all 80C instruments). Only relevant if the Old Tax Regime is cheaper for you.",
        },
      ],
      education: {
        directVsRegular: "Direct vs Regular: Regular plans pay ongoing 1% to 1.5% commissions to distributors every year out of your fund. Over 20 years, that 1% difference compounds to a loss of ₹15–30 Lakhs in your final wealth. Always verify the scheme name contains the word 'Direct - Growth'.",
        expenseRatio: "Expense Ratio: The percentage fee the fund house charges annually for operating the fund. An expense ratio of 0.15% means you pay ₹15 per ₹10,000 invested. Lower expense ratio leaves more money compounding in your pocket.",
      },
    },
    {
      step: 4,
      title: "Set Up Bank Auto-Debit (Payday + 2 Days)",
      description: "Discipline beats timing the market.",
      details: "Schedule your SIP auto-debit (eNACH / UPI mandate) for 2 to 3 days after your salary credit date. That way, your future self is paid first before weekend outings and daily expenses begin.",
    },
    {
      step: 5,
      title: "Step Up Annually & Ignore Daily Noise",
      description: "Investing is a marathon, not day trading.",
      details: "Review your portfolio once a year. When you receive an annual salary raise or appraisal, step up your monthly SIP by 10%. When markets drop, don't stop your SIP — drops let you accumulate more fund units at a discount.",
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-medium text-ink">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Beginner's Playbook
          </span>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">Your first SIP in 5 steps</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Clear, jargon-free steps to start disciplined investing in India. No sales pitch, no commissions.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {steps.map((item) => (
          <div key={item.step} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                {item.step}
              </span>
              <div className="space-y-2 flex-1">
                <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                <p className="text-sm font-medium text-muted-foreground">{item.description}</p>
                {item.details && (
                  <p className="text-xs leading-relaxed text-foreground/80 rounded-xl bg-secondary/50 p-3">
                    {item.details}
                  </p>
                )}

                {item.categories && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {item.categories.map((cat) => (
                      <div key={cat.name} className="rounded-xl border border-border bg-background p-3.5">
                        <span className="rounded-full bg-olive-soft px-2 py-0.5 text-[10px] font-semibold text-ink">
                          {cat.badge}
                        </span>
                        <p className="mt-2 text-sm font-semibold text-foreground">{cat.name}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{cat.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {item.education && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <p className="text-xs font-semibold text-primary">Direct vs Regular Plans</p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/90">{item.education.directVsRegular}</p>
                    </div>
                    <div className="rounded-xl border border-positive/20 bg-positive-soft/20 p-3.5">
                      <p className="text-xs font-semibold text-positive">Expense Ratio Explained</p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/90">{item.education.expenseRatio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEBI DISCLAIMER */}
      <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>SEBI Disclaimer:</strong> Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing. BrokeNoMore is an educational personal finance web application and is not a SEBI-registered investment adviser. We do not recommend specific mutual fund schemes, stocks, or financial products.
          </p>
        </div>
      </div>
    </div>
  );
}
