import { createFileRoute } from "@tanstack/react-router";
import LegalShell, { LegalSection } from "@/components/site/LegalShell";
import { site } from "@/config/site";

export const Route = createFileRoute("/grievance")({
  head: () => ({
    meta: [
      { title: "Grievance Redressal — BrokeNoMore" },
      {
        name: "description",
        content:
          "How to raise a complaint with BrokeNoMore, who the Grievance Officer is, and how long a reply takes.",
      },
      { property: "og:title", content: "Grievance Redressal — BrokeNoMore" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: GrievancePage,
});

function GrievancePage() {
  const { grievance } = site;
  return (
    <LegalShell
      title="Grievance Redressal"
      updated={site.asOf.site}
      intro="If something went wrong with your data, a waitlist request or the app, tell us. This page explains who to contact and what happens next."
    >
      <LegalSection heading="Grievance Officer">
        <dl className="grid gap-3 rounded-2xl border border-border bg-card p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</dt>
            <dd className="mt-1 font-medium">{grievance.officerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</dt>
            <dd className="mt-1 font-medium">{grievance.officerEmail}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Address</dt>
            <dd className="mt-1 font-medium">{grievance.address}</dd>
          </div>
        </dl>
      </LegalSection>

      <LegalSection heading="How to raise a complaint">
        <p>
          Email the Grievance Officer with the subject line "Grievance", or write to the address above. Please
          include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>What happened, with dates.</li>
          <li>The email or mobile number you used with us.</li>
          <li>What you would like us to do.</li>
          <li>Any screenshots or reference numbers, if you have them.</li>
        </ul>
        <p>Do not send your bank password, card number, UPI PIN or one-time passwords.</p>
      </LegalSection>

      <LegalSection heading="What happens next">
        <ol className="list-decimal space-y-2 pl-5">
          <li>We acknowledge your complaint within 48 hours.</li>
          <li>
            We aim to resolve it within {grievance.responseDays} days of receiving it, and will tell you if
            something needs longer.
          </li>
          <li>
            If you are not satisfied with the answer, reply to the same thread and it goes to a second person
            for review.
          </li>
        </ol>
      </LegalSection>

      <LegalSection heading="Data protection complaints">
        <p>
          If your complaint is about how your personal data was handled, you can also raise it with the Data
          Protection Board of India once it is operational. BrokeNoMore is a web app with zero bank connections today, so no
          bank data or passwords are ever read or requested. Any future Account Aggregator sync will require your explicit opt-in and consent can be revoked at any time.
        </p>
      </LegalSection>
    </LegalShell>
  );
}