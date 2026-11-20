// Every number, date and editable detail on the site lives here.
import { getLastReviewedDate } from "../lib/format.js";

export const site = {
  name: "BrokeNoMore",
  tagline: "One safe number every morning.",
  description:
    "BrokeNoMore reserves rent, bills and savings the day your salary lands, then shows one safe-to-spend number every morning. A fast web app for your first salary, plus free financial tools. Android app coming soon.",
  url: "https://brokenomore.in",
  contactEmail: "hello@brokenomore.in",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/brokenomore" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/brokenomore" },
    { label: "X", href: "https://x.com/brokenomore" },
  ],
  grievance: {
    officerName: "Nikhil Sharma",
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
];

export const pricing = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tag: "Live now",
    blurb: "Your daily safe-to-spend number, expense tracker, and all free tools.",
    features: [
      "Safe-to-spend daily number every morning",
      "Rent, bills and savings reserved upfront",
      "Expense tracking with 1-tap categorization",
      "Free tax, SIP, and salary calculators",
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
