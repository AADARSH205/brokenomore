import { createFileRoute } from "@tanstack/react-router";
import LegalShell, { LegalSection } from "@/components/site/LegalShell";
import { site } from "@/config/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BrokeNoMore" },
      {
        name: "description",
        content:
          "What BrokeNoMore collects, where your financial records are stored, what it never collects, and how to export or delete everything yourself.",
      },
      { property: "og:title", content: "Privacy Policy — BrokeNoMore" },
      { property: "og:type", content: "article" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated={site.asOf.site}
      intro="Plain English, because this page is about you. BrokeNoMore shows you a daily spending number. To do that it needs very little, and this page lists exactly what."
    >
      <LegalSection heading="What we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>If you join the waitlist:</strong> the email address or mobile number you give us, and
            whether you ticked the consent box. Nothing else.
          </li>
          <li>
            <strong>If you request a company pilot:</strong> your company name, work email, team size and
            anything you type in the notes box.
          </li>
          <li>
            <strong>If you use the free tools:</strong> nothing is stored. Your salary, bills, savings and
            SIP figures stay in your browser, and the calculator keeps them in the link so you can share it.
          </li>
          <li>
            <strong>If you create an account:</strong> the figures you type in yourself, stored against your
            account so your dashboard is still there next month. That means your salary and salary day, your
            savings target and buffer, expenses and their descriptions, budgets, recurring bills and which
            ones you have paid, savings goals, SIP records, and your tax figures. Each record belongs only to
            the account that created it, and only that account can read it.
          </li>
          <li>
            <strong>Bank data:</strong> none today. BrokeNoMore is a web app where you record what you earn and spend yourself. There is no bank connection, so no bank statement,
            balance, credentials, or net-banking passwords are ever read or requested. Any future read-only sync through an RBI-licensed Account Aggregator will be strictly opt-in, with your explicit consent, once it is live.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="What we never do">
        <ul className="list-disc space-y-2 pl-5">
          <li>We never move, hold or take money. It stays in your own bank account.</li>
          <li>We never sell or rent your data to anyone, including lenders and advertisers.</li>
          <li>We never ask for your net banking password, card number or UPI PIN.</li>
          <li>We never read your bank data, because there is no bank connection to read.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Who can see it">
        <p>
          A small number of people on the BrokeNoMore team, and only when a specific task needs it. Our
          hosting and email providers process data on our instructions. We do not share it with employers
          or with a company running a pilot: they see anonymised, aggregate trends only.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Waitlist and pilot details are kept until you ask us to remove them, or until the beta has closed
          and a year has passed. App data is kept while your account is open. Ask us to delete your account
          and it is removed, usually within 30 days, apart from records we are legally required to keep.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>Ask for a copy of what we hold about you.</li>
          <li>Ask us to correct or delete it.</li>
          <li>Unsubscribe from any email with one click, or by replying to it.</li>
          <li>
            Export everything as a JSON file, or delete all your financial records, from Profile &amp; Settings
            inside the app. Neither needs our permission.
          </li>
        </ul>
        <p>
          Write to{" "}
          <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
            {site.contactEmail}
          </a>{" "}
          and we will act on it.
        </p>
      </LegalSection>

      <LegalSection heading="Analytics">
        <p>
          We count aggregate events such as "calculator used" or "waitlist submitted" so we know which parts
          of the site help people. These events carry no name, email, phone number or financial figure. We do
          not use advertising trackers or sell attention to anyone.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Data is encrypted in transit and at rest. Access is limited to the people who need it, and we
          collect the least we can get away with. If something goes wrong, we will tell affected people and
          the authorities as required by law.
        </p>
      </LegalSection>

      <LegalSection heading="Complaints">
        <p>
          If you are unhappy with how we handled your data, contact our Grievance Officer. Details and
          timelines are on the{" "}
          <a href="/grievance" className="underline underline-offset-2">
            Grievance Redressal
          </a>{" "}
          page. You can also complain to the Data Protection Board of India once it is operational.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If this policy changes in a way that affects you, we will say so on this page and email anyone on
          the waitlist. The date at the top always tells you which version you are reading.
        </p>
      </LegalSection>
    </LegalShell>
  );
}