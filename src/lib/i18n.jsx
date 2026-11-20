import { createContext, useContext, useEffect, useState } from "react";

/**
 * Hinglish translations for BrokeNoMore.
 * Conversational, modern Indian millennial / Gen-Z salaried professional tone (age 21-28).
 * Never stiff or archaic formal Hindi.
 */
export const TRANSLATIONS = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_how_it_works: "How it works",
    nav_tools: "Tools",
    nav_pricing: "Pricing",
    nav_companies: "For companies",
    sign_in: "Sign in",
    start_free: "Start free",
    open_dashboard: "Open dashboard",

    // Hero
    hero_badge: "Daily money control · For your first salary in India",
    hero_title: "One safe-to-spend number every morning. Stop going broke by the 20th.",
    hero_sub: "Take control of your first salary. A fast web app that calculates one safe-to-spend number every morning after reserving rent, bills, and monthly savings. Android app coming soon.",
    hero_primary_cta: "Start free",
    hero_secondary_cta: "Try Salary Calculator",
    hero_demo_walkthrough: "Want a walkthrough first?",
    hero_book_demo: "Book a 15-min demo",

    // What's live
    whats_live_tag: "Transparency",
    whats_live_title: "What's live today vs what's coming",

    // Daily Calculator
    calc_tag: "The daily number",
    calc_heading: "Find your number in about twenty seconds.",
    calc_sub: "Same maths as the web app: salary minus bills minus savings, divided by the days left.",
    calc_in_hand_label: "In-hand salary each month",
    calc_in_hand_hint: "What actually reaches your bank",
    calc_bills_label: "Fixed bills each month",
    calc_bills_hint: "Rent, EMIs, phone, subscriptions",
    calc_savings_label: "Savings you want to set aside",
    calc_savings_hint: "What you refuse to spend",
    calc_days_label: "Days until your next salary",
    calc_days_hint: "Count from today",
    calc_safe_today: "Safe to spend today",
    calc_days_left: "days left",
    calc_estimate_from_ctc: "Estimate from CTC →",

    // Tools
    tools_tag: "Free tools",
    tools_heading: "The things nobody explains in your first job.",
    tools_sub: "No signup, no email wall. Everything here runs on the numbers you type and nothing else.",
    tools_tab_tax: "Tax planner (FY 2026-27)",
    tools_tab_invest: "SIP Planner",
    tools_tab_credit: "Credit score",

    // Tax Calculator
    tax_title: "Do I owe tax? Old vs New regime",
    tax_subtitle: "FY 2026-27 (AY 2027-28) rules with 7 slabs and Section 87A rebate.",
    tax_annual_ctc: "Annual CTC or Gross Salary",
    tax_basic: "Annual Basic Salary",
    tax_rent_paid: "Annual Rent Paid",
    tax_hra_received: "Annual HRA Received",
    tax_metro_label: "Living in Delhi, Mumbai, Kolkata or Chennai",
    tax_80c_label: "Section 80C Deductions (PPF, ELSS, EPF, Life Ins)",
    tax_80d_label: "Section 80D (Health Insurance Premium)",
    tax_nps_label: "Section 124(3) / 80CCD(1B) Voluntary NPS",
    tax_employer_nps: "Section 80CCD(2) Employer NPS",
    tax_better_regime: "Better for you",
    tax_saves: "saves",
    tax_zero_message: "You owe zero tax under both regimes!",

    // SIP
    sip_title: "What could a SIP grow to?",
    sip_reverse_title: "Target to Monthly SIP (Reverse Mode)",
    sip_monthly: "Monthly SIP",
    sip_years: "Time horizon (Years)",
    sip_expected_return: "Expected return (% p.a.)",
    sip_step_up: "Annual step-up (% each year)",
    sip_inflation_toggle: "Inflation-adjusted (6%)",
    sip_disclaimer: "Illustrative scenarios, not guaranteed",

    // Onboarding
    ob_screen1_title: "When do you get paid, and how much?",
    ob_screen2_title: "What bills must be paid every month?",
    ob_screen3_title: "What are you setting money aside for?",
    ob_screen4_title: "Your first safe-to-spend number",
  },

  hi: {
    // Navigation
    nav_home: "Home",
    nav_how_it_works: "Kaise kaam karta hai",
    nav_tools: "Free Tools",
    nav_pricing: "Pricing",
    nav_companies: "Companies ke liye",
    sign_in: "Sign in",
    start_free: "Free me start karo",
    open_dashboard: "Dashboard kholo",

    // Hero
    hero_badge: "Daily money control · Pehli salary ke liye",
    hero_title: "Roz subah ek safe-to-spend number. Month-end me broke mat ho.",
    hero_sub: "Apni pehli salary ko smartly manage karo. Salary aate hi rent, bills aur savings alag rakh lo — aur bacha hua paisa roz ek calm number ke saath tension-free kharch karo. Android app jald aa raha hai.",
    hero_primary_cta: "Free me start karo",
    hero_secondary_cta: "Salary Calculator dekho",
    hero_demo_walkthrough: "Demo dekhna chahte ho?",
    hero_book_demo: "15-min demo book karo",

    // What's live
    whats_live_tag: "Puri Transparency",
    whats_live_title: "Aaj kya live hai vs kya aane wala hai",

    // Daily Calculator
    calc_tag: "Daily safe number",
    calc_heading: "20 seconds me apna daily number nikalo.",
    calc_sub: "Web app wala simple hisaab: In-hand salary minus bills minus savings, divided by bache hue din.",
    calc_in_hand_label: "Har mahine in-hand salary",
    calc_in_hand_hint: "Jo paisa bank me transfer hota hai",
    calc_bills_label: "Har mahine ke fixed bills",
    calc_bills_hint: "Rent, WiFi, phone, EMI",
    calc_savings_label: "Savings jo alag rakhni hai",
    calc_savings_hint: "Jisko touch nahi karna",
    calc_days_label: "Agli salary tak kitne din bache hain",
    calc_days_hint: "Aaj se count karo",
    calc_safe_today: "Aaj kharch karne ke liye safe hai",
    calc_days_left: "din bache hain",
    calc_estimate_from_ctc: "CTC se in-hand nikalo →",

    // Tools
    tools_tag: "Free tools",
    tools_heading: "Woh baatein jo pehli job me koi nahi samjhata.",
    tools_sub: "Koi signup nahi, koi email barrier nahi. Sirf apne numbers daalo aur result dekho.",
    tools_tab_tax: "Tax planner (FY 2026-27)",
    tools_tab_invest: "SIP Planner",
    tools_tab_credit: "Credit score",

    // Tax Calculator
    tax_title: "Kya mujhe tax dena padega? Old vs New regime",
    tax_subtitle: "FY 2026-27 ke naye 7 slabs aur Section 87A rebate ke saath.",
    tax_annual_ctc: "Annual CTC ya Gross Salary",
    tax_basic: "Annual Basic Salary",
    tax_rent_paid: "Saal ka Rent (Rent paid)",
    tax_hra_received: "Milne wala HRA",
    tax_metro_label: "Delhi, Mumbai, Kolkata ya Chennai me rehte ho",
    tax_80c_label: "Section 80C Deductions (PPF, ELSS, EPF)",
    tax_80d_label: "Section 80D (Health Insurance Premium)",
    tax_nps_label: "Section 124(3) / 80CCD(1B) Self NPS (Max ₹50k)",
    tax_employer_nps: "Section 80CCD(2) Employer NPS",
    tax_better_regime: "Aapke liye better hai",
    tax_saves: "bachata hai",
    tax_zero_message: "Dono regime me aapka tax ₹0 banta hai!",

    // SIP
    sip_title: "Aapka SIP kitna grow ho sakta hai?",
    sip_reverse_title: "Goal se monthly SIP nikalo (Reverse Mode)",
    sip_monthly: "Monthly SIP",
    sip_years: "Kitne saal ke liye (Years)",
    sip_expected_return: "Expected return (% saal ka)",
    sip_step_up: "Yearly increase (% Step-up)",
    sip_inflation_toggle: "Mehengai adjust karke (6% Inflation)",
    sip_disclaimer: "Mathematical illustration, guaranteed return nahi hai",

    // Onboarding
    ob_screen1_title: "Salary kab aati hai aur kitni aati hai?",
    ob_screen2_title: "Har mahine ke zaroori bills kitne hain?",
    ob_screen3_title: "Sabse pehle kis goal ke liye save karna hai?",
    ob_screen4_title: "Yeh raha aapka pehla safe-to-spend number!",
  },
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("brokenomore_lang");
    if (saved === "hi" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("brokenomore_lang", lang);
    }
  };

  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
