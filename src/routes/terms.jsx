import { createFileRoute } from "@tanstack/react-router";
import LegalShell, { LegalSection } from "@/components/site/LegalShell";
import { site } from "@/config/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — BrokeNoMore" },
      {
        name: "description",
        content:
          "The rules for using the BrokeNoMore site, calculator and free tools, and what the app does and does not do with your money.",
      },
      { property: "og:title", content: "Terms of Use — BrokeNoMore" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalShell
      title="Terms of Use"
      updated={site.asOf.site}
      intro="Short version: use the tools honestly, understand that they are educational, and remember that BrokeNoMore never holds your money."
    >
      <LegalSection heading="What this site is">
        <p>
          BrokeNoMore is a web app and a set of free educational financial tools. The Android app is coming soon (waitlist open).
          Where something is not live yet, it is labelled coming soon or waitlist. Nothing on this site is
          an offer of credit, insurance, investment advice or tax advice.
        </p>
      </LegalSection>

      <LegalSection heading="Your money stays with you">
        <p>
          BrokeNoMore is not a bank and not a wallet. It never holds, moves or takes custody of your money.
          Amounts are marked as reserved inside the app. Your bank balance stays exactly where it is.
        </p>
      </LegalSection>

      <LegalSection heading="Calculations are estimates">
        <p>
          The daily number is arithmetic on the figures you type: salary minus bills minus savings, divided
          by the days left. SIP projections show three illustrative return scenarios and are never a
          prediction or a guarantee. The credit score tool gives a range from your own answers; it does not
          read your credit report. Always confirm with a professional, your lender or your bureau before
          acting.
        </p>
      </LegalSection>

      <LegalSection heading="Waitlist and pilot requests">
        <p>
          Joining the waitlist or requesting a pilot costs nothing and creates no contract. It is a request
          for us to contact you. We may not be able to offer a place, and we will tell you if that is the
          case.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not submit someone else's email or phone number.</li>
          <li>Do not attempt to break, scrape or overload the site.</li>
          <li>Do not use the tools to mislead another person about their money.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Availability">
        <p>
          We aim to keep the site up and accurate, but we do not promise uninterrupted service. Tax sections,
          limits and dates change; every tool shows the date its figures were checked.
        </p>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          To the extent the law allows, BrokeNoMore is not liable for decisions you make based on the free
          tools or illustrative projections. Nothing here limits your rights under Indian consumer law.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of India, and the courts of India have jurisdiction. If any
          part is unenforceable, the rest stays in force.
        </p>
      </LegalSection>
    </LegalShell>
  );
}