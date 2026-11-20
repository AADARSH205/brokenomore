import { Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function FounderNote() {
  return (
    <section aria-labelledby="founder-note-heading" className="border-t border-border bg-card py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-secondary/40 p-6 sm:p-12 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <Heart className="h-4 w-4 text-accent fill-accent/20" />
            <span>Why I built this</span>
          </div>

          <h2
            id="founder-note-heading"
            className="mt-4 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight tracking-tight text-foreground"
          >
            "On the 1st of the month, I felt rich. By the 18th, I was doing panic math at 11 PM."
          </h2>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              When I landed my first job in Bangalore at 22, getting that first salary notification was exhilarating. But within two weeks, reality hit: rent was due, security deposit instalments were pending, groceries had to be bought, and splitting weekend dinners with friends felt like a high-stakes gamble.
            </p>
            <p>
              I tried every popular money app. Every single one either demanded full read access to my bank account and private OTPs, overwhelmed me with 40 complex budget categories I didn't care about, or bombarded me with push notifications trying to sell me personal loans and credit cards.
            </p>
            <p>
              I didn't need an audit. I didn't want to sell my financial privacy. I just needed one calm, honest number when I woke up each morning:
            </p>
            <blockquote className="rounded-2xl border-l-4 border-accent bg-background/80 px-5 py-4 font-medium italic text-foreground">
              "What is safe to spend today so that rent is paid, savings are kept, and I don’t run out before next payday?"
            </blockquote>
            <p>
              That is why BrokeNoMore exists. We built it as a lightweight web app that respects your privacy. No bank logins, no selling your data, and no corporate financial jargon. Just the clarity and control I wish I had on day one of my first job.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nikhil</p>
                <p className="text-xs text-muted-foreground">Founder, BrokeNoMore</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-positive" />
              <span>100% independent · No credit card pitches</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
