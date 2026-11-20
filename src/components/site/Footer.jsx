import { site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-2">
            <a href="/" className="flex items-baseline gap-1 text-lg font-semibold tracking-tight">
              <span className="font-display">Broke</span>
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-sm font-semibold text-primary-foreground">
                NoMore
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A fast, privacy-focused web app for your first salary. One safe-to-spend number every morning.
            </p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="mt-4 inline-block text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {site.contactEmail}
            </a>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Calculators</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/safe-to-spend-calculator" className="text-muted-foreground hover:text-foreground">
                  Daily Safe-to-Spend
                </a>
              </li>
              <li>
                <a href="/old-vs-new-tax-regime-calculator" className="text-muted-foreground hover:text-foreground">
                  Old vs New Tax (FY 2026-27)
                </a>
              </li>
              <li>
                <a href="/in-hand-salary-calculator" className="text-muted-foreground hover:text-foreground">
                  In-Hand Salary Calculator
                </a>
              </li>
              <li>
                <a href="/sip-calculator" className="text-muted-foreground hover:text-foreground">
                  SIP Calculator & Reverse
                </a>
              </li>
              <li>
                <a href="/hra-calculator" className="text-muted-foreground hover:text-foreground">
                  HRA Exemption Calculator
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Site & Legal</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/companies" className="text-muted-foreground hover:text-foreground">
                  For Companies (Pilots)
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="/grievance" className="text-muted-foreground hover:text-foreground">
                  Grievance Redressal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Elsewhere
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {site.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.name}. Live web app. Your money stays in your own bank account — zero bank logins, no bank connection required today.
          </p>
          <p>Last reviewed: {site.asOf.site}. Android app coming soon.</p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          BrokeNoMore is not a bank, an RBI-regulated lender, or a SEBI-registered investment adviser. The tools and calculations on this site are for educational purposes only.
        </p>
      </div>
    </footer>
  );
}
