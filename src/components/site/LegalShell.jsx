import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import { site } from "@/config/site";

export default function LegalShell({ title, updated, intro, children }) {
  return (
    <div className="min-h-screen bg-background">
      <Nav base="/" />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        {intro && <p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p>}
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground/90">{children}</div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed">
          Questions about any of this? Write to{" "}
          <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
            {site.contactEmail}
          </a>
          . For formal complaints, see{" "}
          <a href="/grievance" className="underline underline-offset-2">
            Grievance Redressal
          </a>
          .
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}