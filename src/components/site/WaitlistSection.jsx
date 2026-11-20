import WaitlistForm from "@/components/site/WaitlistForm";

export default function WaitlistSection() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-heading" className="mx-auto max-w-2xl px-5 pb-20 sm:pb-24">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-olive-soft px-2.5 py-0.5 text-[11px] font-medium text-ink">
            Coming Soon
          </span>
          <h2 id="waitlist-heading" className="text-lg font-semibold tracking-tight">
            Android App Waitlist
          </h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          While the web app is live right now in your mobile browser, our native Android app is currently in development. Join the waitlist to receive an invite the moment it lands on Google Play.
        </p>
        <div className="mt-5">
          <WaitlistForm source="waitlist" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Don't want to wait? You can{" "}
          <a href="/register" className="font-medium underline underline-offset-2 hover:text-foreground">
            use the live web app for free right now
          </a>
          .
        </p>
      </div>
    </section>
  );
}
