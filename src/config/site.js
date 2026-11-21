// Every number, date and editable detail on the site lives here.
import { getLastReviewedDate } from "../lib/format.js";

export const site = {
  name: "BrokeNoMore",
  tagline: "One safe number every morning.",
  description:
    "BrokeNoMore reserves rent, bills and savings the day your salary lands, then shows one safe-to-spend number every morning. A fast web app for your first salary, plus free financial tools. Android app coming soon.",
  url: "https://localhost:5173",
  contactEmail: "hello@brokenomore.in",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/brokenomore" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/brokenomore" },
    { label: "X", href: "https://x.com/brokenomore" },
  ],
  grievance: {
    officerName: "User",
    officerEmail: "grievance@brokenomore.in",
    address: "BrokeNoMore Technologies, Indiranagar, Bengaluru, Karnataka 560038, India",
    responseDays: 15,
  },
  // Single source of truth for dates shown on the site (dynamically evaluated).
  get asOf() {
    const reviewed = getLastReviewedDate();
    return {
      site: reviewed,
      tools: reviewed,
      pricing: reviewed,
    };
  },
  appStatus: {
    web: "Live web app (instant access in mobile & desktop browser)",
    android: "Android app coming soon (waitlist open)",
    ios: "Coming soon",
  },
  // Shared by the hero demo and the calculator, so both tell the same story.
  sampleFigures: {
    salary: 45000,
    bills: 12000,
    savings: 6000,
    days: 30,
  },
  nav: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Daily number", href: "#calculator" },
    { label: "App preview", href: "#preview" },
    { label: "What's live", href: "#live-status" },
    { label: "Free tools", href: "#tools" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
};

export const faqs = [
  {
    q: "Does BrokeNoMore move or hold my money?",
    a: "No. Your money stays in your own bank account, and nothing here can move or touch it. You record your salary and spending yourself, and BrokeNoMore only does the arithmetic on what you entered.",
  },
  {
    q: "What access do you get to my bank account?",
    a: "None. BrokeNoMore has zero bank logins, asks for no net banking credentials, no OTPs, and no UPI PINs. It is 100% manual entry today for complete privacy. (Optional read-only sync through the RBI's Account Aggregator framework is on our future roadmap for users who prefer automation, but it is not live today).",
  },
  {
    q: "Is BrokeNoMore a mobile app or a web app?",
    a: "BrokeNoMore is a live web app that runs directly in your browser on phone, tablet, or laptop without needing an app store install. A native Android app is coming soon — you can join the Android waitlist to get early access.",
  },
  {
    q: "What if a transaction is tracked wrongly?",
    a: "Every transaction in the app can be recategorised or deleted in one tap. Your correction changes that day's number immediately and recalculates your remaining daily allowance.",
  },
  {
    q: "How does BrokeNoMore make money?",
    a: "A Pro plan at ₹49 a month once it launches, and paid wellbeing pilots for companies. The core daily number and free money tools stay free. We never sell your data, and we do not push personal loans or credit cards.",
  },
  {
    q: "How much will it cost?",
    a: "The core daily safe-to-spend number and free tools are free forever. Pro, at ₹49 a month, will add multi-week outlooks and shared household budgets once it ships. Companies can request a pilot per seat. Prices are reviewed regularly.",
  },
  {
    q: "How do I delete my data?",
    a: "Open Settings inside the web app and click 'Delete all financial data': every expense, budget, bill, goal, and calculation is wiped immediately. You can also export a complete JSON copy of your records with one click before deleting.",
  },
  {
    q: "Is my data safe?",
    a: "Data is encrypted in transit and at rest. We collect minimal information: your salary cycle, fixed expenses, and the spending figures you record. We never sell, rent, or share personal data with third parties or lenders.",
  },
  {
    q: "How can I save tax on health insurance?",
    a: "Invest in health insurance under Section 80D and save up to ₹25,000 (₹50,000 if you and your family are covered, including parents). Additional deductions under 80DD (₹25,000) for parents with disabilities and 80D (child) up to ₹1,000 for preventive checkups.",
  },
  {
    q: "How can I save tax on donations?",
    a: "Donate to verified 80G organizations and claim deductions up to 10% of your total income. Donate through eligible mutual funds or directly to registered trusts. Always keep the 16A certificate for tax filing.",
  },
  {
    q: "How can I save tax on home loans?",
    a: "Under Section 24B, claim up to ₹2 lakh deduction for home loan interest. Under Section 80C, claim up to ₹1.5 lakh for principal repayment, ELSS mutual funds, PPF, NPS, and other tax-saving investments.",
  },
  {
    q: "How can I build a good credit score?",
    a: "Keep credit card utilization below 30%, make all payments on time, avoid multiple loan applications in a short period, and check your CIBIL score regularly (free once a year from CIBIL/Experian). A good score (750+) means lower interest rates on loans.",
  },
  {
    q: "What type of investments should I start with?",
    a: "Start with tax-efficient options: ELSS mutual funds (80C), NPS (80CCD 1B), PPF for long-term goals. Set up SIPs with ₹500-1,000/month for rupee-cost averaging. Avoid trying to time the market.",
  },
  {
    q: "Do I need a financial advisor?",
    a: "For basic budgeting and saving, BrokeNoMore's free tools are enough. For complex situations like home loans, inheritance, or business finance, a fee-only certified financial planner is worth consulting once.",
  },
];

export const taxSavingsGuide = [
  { section: "80D", title: "Health Insurance", savings: "Up to ₹25,000 (₹50,000 with parents)", description: "Premiums for yourself, spouse, children and parents. Includes preventive checkups up to ₹1,000." },
  { section: "80D(1)", title: "Maternity Benefit", savings: "Up to ₹10,000", description: "Maternity insurance cover for expecting mothers." },
  { section: "80DD", title: "Disabled Dependent", savings: "₹25,000 - ₹75,000", description: "For dependent siblings or relatives with disability. Higher limit for severe disability." },
  { section: "80U", title: "Self-Disability", savings: "Up to ₹75,000", description: "For persons with disability (80% or more). Also for family members listed in return." },
  { section: "80C", title: "General Tax Savings", savings: "Up to ₹1.5 lakh", description: "PPF, ELSS, NSC, ULIPs, life insurance, principal home loan, Sukanya Samriddhi, NPS." },
  { section: "80CCD(1B)", title: "Additional NPS", savings: "Up to ₹50,000", description: "Extra deduction over and above 80C limit for NPS contributions." },
  { section: "80G", title: "Donations", savings: "100% of donation", description: "Donations to registered trusts. Some allow 50%, others 100% deduction." },
  { section: "24B", title: "Home Loan Interest", savings: "Up to ₹2 lakh", description: "Deduction for housing loan interest. Higher if self-occupied, deduction for let-out property." },
];

export const creditTips = {
  buildingScore: [
    "Pay all credit card bills in full and on time",
    "Keep credit utilization below 30% (ideally 10%)",
    "Avoid closing old credit cards - length of history matters",
    "Make at least 75% of payments on time",
    "Get a free CIBIL/Experian report once a year",
    "Limit new credit applications to one every 3-6 months",
    "Use credit cards for small monthly expenses and clear them",
  ],
  improvingScore: [
    "Dispute any incorrect late payments on your report",
    "Become an authorized user on a parent/sibling's good credit card",
    "Keep old credit cards active with small usage",
    "Pay credit card balances before statement date",
    "Gradually increase credit limits on existing cards",
  ],
  creditCards: [
    { name: "HDFC Bank Regalia", best_for: "Travel rewards", annual_fee: "₹2,500" },
    { name: "ICICI Sapphiro", best_for: "Airport lounge access", annual_fee: "Free for first year" },
    { name: "Axis Bank Ace", best_for: "Cashback on groceries", annual_fee: "₹499" },
    { name: "Kotak Mahindra", best_for: "Zero forex markup", annual_fee: "₹2,000" },
  ],
};

export const emergencyFund = {
  months: [3, 4, 5, 6],
  description: "Keep 3-6 months of living expenses in an easily accessible account. This prevents debt when unexpected expenses hit.",
  guidelines: [
    "Start with 3 months for stable jobs, 6 months for startups",
    "Include variable expenses like festivals, medical emergencies",
    "Keep in savings account or liquid mutual funds",
    "Automate transfers monthly to build consistently",
  ],
};

export const investmentOptions = [
  {
    category: "Short Term (1-3 years)",
    options: [
      { name: "Fixed Deposit", expected_return: "6-7%", risk: "Low", lock_in: "None" },
      { name: "Savings Account", expected_return: "3-4%", risk: "Low", lock_in: "None" },
      { name: "Liquid Fund", expected_return: "6-7%", risk: "Low", lock_in: "None" },
    ],
  },
  {
    category: "Medium Term (3-7 years)",
    options: [
      { name: "PPF", expected_return: "7.1%", risk: "Low", lock_in: "15 years (with 5 yr partial withdrawal)" },
      { name: "ELSS Mutual Fund", expected_return: "10-12%", risk: "Medium", lock_in: "3 years" },
      { name: "Ultra Short Debt Fund", expected_return: "7-8%", risk: "Low-Medium", lock_in: "None" },
    ],
  },
  {
    category: "Long Term (7+ years)",
    options: [
      { name: "Equity Mutual Funds", expected_return: "12-15%", risk: "High", lock_in: "None" },
      { name: "NPS", expected_return: "10-12%", risk: "Medium-High", lock_in: "Full withdrawal at 60" },
      { name: "Real Estate", expected_return: "8-10%", risk: "High", lock_in: "Years" },
    ],
  },
];

export const toolsSection = [
  {
    id: "daily-number",
    title: "Daily Safe-to-Spend Number",
    subtitle: "One calm number every morning",
    description: "Reserve your rent, bills and savings, then spend freely with confidence.",
  },
  {
    id: "expense-tracker",
    title: "Expense Tracker",
    subtitle: "Track where every rupee goes",
    description: "Categorise expenses in one tap. See your daily number adjust instantly.",
  },
  {
    id: "tax-calculator",
    title: "Tax Savings Calculator",
    subtitle: "Maximise your deductions",
    description: "Calculate 80D, 80C, 80CCD(1B) and other deductions to find your taxable income.",
  },
  {
    id: "sip-calculator",
    title: "SIP Investment Planner",
    subtitle: "Plan your wealth goal",
    description: "See how monthly investments grow with compound interest and market returns.",
  },
  {
    id: "salary-calculator",
    title: "Take Home Salary",
    subtitle: "Know your net",
    description: "Calculate post-tax income after EPF, PT, ESIC and tax deductions.",
  },
  {
    id: "credit-score",
    title: "Credit Score Guide",
    subtitle: "Build CIBIL the smart way",
    description: "Understand factors, get tips to improve, and see which cards suit you.",
  },
  {
    id: "emergency-fund",
    title: "Emergency Fund Calculator",
    subtitle: "How much to save",
    description: "Calculate 3-6 months expense buffer. Plan your safety net.",
  },
  {
    id: "investment-planner",
    title: "Investment Options",
    subtitle: "Choose what's right for you",
    description: "Explore FD, PPF, ELSS, NPS, and equity options with expected returns.",
  },
];

export const pricing = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tag: "Live now",
    blurb: "All core financial tools to start your financial journey.",
    features: [
      "Daily safe-to-spend number every morning",
      "Rent, bills and savings reserved upfront",
      "Expense tracking with 1-tap categorization",
      "Tax savings calculator (80D, 80C, 80CCD(1B))",
      "SIP investment planner with projections",
      "Emergency fund calculator (3-6 months buffer)",
      "Credit score guide & card recommendations",
      "Investment options (FD, PPF, ELSS, NPS)",
      "1-click data export and instant data wipe",
    ],
    cta: "Start free",
    highlight: true,
  },
  {
    name: "Pro",
    price: "₹49",
    period: "per month",
    tag: "Waitlist",
    blurb: "For months when you want weekly foresight and shared household budgets.",
    features: [
      "Everything in Free",
      "Weekly outlook & payday cashflow forecasting",
      "Salary planning for irregular & freelance pay",
      "Shared budgets for flatmates or partners",
      "Priority human support",
    ],
    cta: "Join Pro waitlist",
    highlight: false,
  },
  {
    name: "Companies",
    price: "Custom",
    period: "per seat, billed yearly",
    tag: "Pilot",
    blurb: "Financial wellbeing for early-career hires, without the jargon.",
    features: [
      "Seats for your entire new-hire cohort",
      "Anonymised, aggregate wellbeing trends",
      "Onboarding session for new joiners",
      "GST invoicing and company onboarding",
    ],
    cta: "Explore company pilots",
    highlight: false,
  },
];
