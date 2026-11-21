const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { Coffee, Bike, UtensilsCrossed, RotateCcw, Plus } from "lucide-react";

import { site } from "@/config/site";
import { afterSpends, computeDailyNumber, formatINR } from "@/lib/money";

const CHIPS = [
  { label: "Chai", amount: 40, icon: Coffee },
  { label: "Auto", amount: 85, icon: Bike },
  { label: "Dinner", amount: 320, icon: UtensilsCrossed },
];

const sample = computeDailyNumber(site.sampleFigures);
const DAILY = sample.daily;

export default function PhoneDemo() {
  const [spent, setSpent] = useState(0);
  const [custom, setCustom] = useState("");
  const view = afterSpends(DAILY, spent);

  const add = (amount, label) => {
    if (!amount || amount <= 0) return;
    setSpent((value) => value + amount);
    try { db?.analytics?.track?.({ eventName: "hero_demo_tap", properties: { chip: label } }); } catch { /* ignore */ }
  };

  const addCustom = (event) => {
    event.preventDefault();
    const amount = Number(custom);
    if (!Number.isFinite(amount) || amount <= 0) return;
    add(Math.min(amount, 100000), "custom");
    setCustom("");
  };

  const reset = () => setSpent(0);

  return (
    <div className="mx-auto w-full max-w-[330px]">
      <div className="rounded-[2.6rem] border border-ink/25 bg-ink p-2.5 shadow-phone">
        <div className="rounded-[2.15rem] bg-cream px-4 pb-5 pt-4 text-ink">
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">
            <span>Thu, 20 Nov</span>
            <span>Live Web App</span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink/60">Safe to spend today</p>
            <p
              aria-live="polite"
              className={`mt-1 font-display text-[3.2rem] leading-none tracking-tight transition-colors ${
                view.over ? "text-amber" : "text-ink"
              }`}
            >
              {formatINR(view.remaining)}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
              {view.over
                ? `You are ${formatINR(view.overspend)} over today. Tomorrow's number drops to ${formatINR(view.tomorrow)}.`
                : spent > 0
                  ? `Spent today ${formatINR(spent)}. Rent, bills and savings are already set aside.`
                  : "Rent, bills and savings are already reserved. This is what is left for today."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1.5 text-[10px] font-medium uppercase tracking-wide">
            <div className="rounded-xl bg-ink/10 px-2 py-1.5 text-center">
              <span className="block text-ink/55">Rent</span>
              <span className="text-ink">₹9,000</span>
            </div>
            <div className="rounded-xl bg-ink/10 px-2 py-1.5 text-center">
              <span className="block text-ink/55">Bills</span>
              <span className="text-ink">₹3,000</span>
            </div>
            <div className="rounded-xl bg-ink/10 px-2 py-1.5 text-center">
              <span className="block text-ink/55">Savings</span>
              <span className="text-ink">₹6,000</span>
            </div>
          </div>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/55">Tap a spend</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => add(chip.amount, chip.label.toLowerCase())}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 bg-cream px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {chip.label} {formatINR(chip.amount)}
                </button>
              );
            })}
          </div>

          <form onSubmit={addCustom} className="mt-2 flex gap-1.5">
            <label htmlFor="hero-custom" className="sr-only">
              Custom amount in rupees
            </label>
            <input
              id="hero-custom"
              type="number"
              inputMode="numeric"
              min="1"
              max="100000"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder="Custom ₹"
              className="h-9 w-full rounded-full border border-ink/25 bg-cream px-3 text-xs text-ink placeholder:text-ink/45"
            />
            <button
              type="submit"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-cream"
              aria-label="Add custom spend"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          {spent > 0 && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-ink/60 underline underline-offset-2 hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Start the day again
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-cream/80">
        Sample figures: ₹{site.sampleFigures.salary.toLocaleString("en-IN")} in hand, ₹
        {site.sampleFigures.bills.toLocaleString("en-IN")} bills, ₹
        {site.sampleFigures.savings.toLocaleString("en-IN")} savings, {site.sampleFigures.days} days.
      </p>
    </div>
  );
}