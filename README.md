# BrokeNoMore

Marketing site and free finance tools for young Indian professionals on their first salary.
The Android app is in beta; the site collects the waitlist and pilot requests.

## What is here

- One scrolling page: hero with an interactive phone demo, daily-number calculator, how it works,
  why people open it daily, three free tools, companies, pricing, FAQ, final waitlist.
- Separate pages: `/privacy`, `/terms`, `/grievance`.
- Waitlist and pilot forms write to the app's database and send a confirmation email. No form is a mock.
- SEO: per-page title and description, Open Graph and Twitter cards, JSON-LD (Organization + FAQPage),
  `/sitemap.xml`, `/robots.txt`.

## Stack note

The brief asked for Next.js + TypeScript + Supabase + Resend on Vercel. This app runs on Base44's
TanStack Start runtime instead: same React + Tailwind + shadcn/ui frontend, with Base44 providing the
database, the server functions (the equivalent of server actions) and transactional email. Nothing needs
to be wired up by hand, and there are no third-party keys to manage. See `.env.example`.

## Where things live

- `src/config/site.js` — every editable detail: contact email, socials, grievance officer (TODO
  placeholders), the "as of" dates, the sample figures shared by the hero and the calculator, FAQ copy,
  pricing.
- `src/data/tax-deductions.js` — the tax guide's single data file. Section numbers follow the
  Income-tax Act, 2025 (Chapter VIII, sections 122-154), with the earlier 1961 numbers for the toggle.
- `src/lib/money.js` — all maths: daily number, spend split, overspend, SIP projection, inflation,
  credit band. Pure functions, no React.
- `src/lib/server-fns.js` — the two server functions behind the forms, with validation, honeypot,
  duplicate and rate checks, database writes and confirmation email.
- `base44/entities/` — `WaitlistSignup` and `PilotRequest` schemas and access rules.
- `tests/money.test.mjs` — unit tests for the calculator and SIP maths.

## Run the tests

```bash
node tests/money.test.mjs
```

## Deployment

1. Publish the app from the Base44 editor (Publish button, top right).
2. Set the real domain in `src/config/site.js` (`site.url`) before publishing, so the canonical URL,
   Open Graph URL, `sitemap.xml` and `robots.txt` all point at it.
3. Replace the TODO placeholders in `src/config/site.js`: contact email, social links, and the
   Grievance Officer's name, email and address. These are legally required details, not decoration.

## Email and mobile signups

Mobile numbers are stored in the same table. There is no SMS provider connected, so mobile signups
need manual outreach from the team; the form's success message does not promise a text. Email signups
get an automatic confirmation.

## Email

Confirmation email is sent with the platform's `SendEmail` integration from the server functions. It
reaches registered app users reliably; delivery to other addresses depends on the plan and a verified
sending domain. If a send fails the signup is still stored, so nothing is lost.

## Data and privacy

- The calculator stores nothing on the server. Inputs live in the URL query string so results are
  shareable.
- Analytics events are aggregate only (`calculator_share`, `waitlist_submit`, `tool_tab`,
  `pilot_submit`), with no PII and no financial figures.
- `WaitlistSignup` and `PilotRequest` are readable only by the person who submitted them and by app
  admins; updates and deletes are admin-only. The forms write through the server function, so the
  database never accepts anonymous reads.

## Before launch

- [ ] Real contact email and social links in `src/config/site.js`
- [ ] Real Grievance Officer details
- [ ] Real domain in `site.url`
- [ ] Re-verify every tax limit and section number against incometax.gov.in
- [ ] Re-verify pricing and the "as of" dates
