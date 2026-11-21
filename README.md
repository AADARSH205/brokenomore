# BrokeNoMore

Marketing site and free finance tools for young Indian professionals on their first salary.
The Android app is in beta; the site collects the waitlist and pilot requests.

## What is here

- One scrolling page: hero with an interactive phone demo, daily-number calculator, how it works,
  why people open it daily, 8+ free tools, companies, pricing, FAQ, final waitlist.
- Separate pages: `/privacy`, `/terms`, `/grievance`.
- Waitlist and pilot forms write to the app's database and send a confirmation email. No form is a mock.
- SEO: per-page title and description, Open Graph and Twitter cards, JSON-LD (Organization + FAQPage),
  `/sitemap.xml`, `/robots.txt`.

## Free Tools Available

1. **Daily Safe-to-Spend Number** - One calm number every morning after reserving rent, bills and savings
2. **Expense Tracker** - Track where every rupee goes with 1-tap categorization
3. **Tax Savings Calculator** - Compare Old vs New tax regimes, calculate 80D, 80C, 80CCD(1B) deductions
4. **SIP Investment Planner** - Project wealth growth, reverse SIP for target goals
5. **Take Home Salary Tool** - Calculate post-tax income after EPF, PT, ESIC and tax deductions
6. **Credit Score Guide** - Understand CIBIL factors, get improvement tips, find best cards for you
7. **Emergency Fund Calculator** - Calculate 3-6 months expense buffer for financial security
8. **Investment Options Explorer** - Compare FD, PPF, ELSS, NPS, equity with expected returns and risks

## Stack note

The brief asked for Next.js + TypeScript + Supabase + Resend on Vercel. This app runs on Base44's
TanStack Start runtime instead: same React + Tailwind + shadcn/ui frontend, with Base44 providing the
database, the server functions (the equivalent of server actions) and transactional email. Nothing needs
to be wired up by hand, and there are no third-party keys to manage.

## Where things live

- `src/config/site.js` — every editable detail: contact email, socials, grievance officer details, tool descriptions, FAQ, pricing
- `src/data/tax-deductions.js` — comprehensive tax guide with all deductions under Income-tax Act 2025
- `src/lib/money.js` — all maths: daily number, spend split, SIP projection, inflation, credit band estimation
- `src/lib/server-fns.js` — server functions behind waitlist, pilot, and booking forms with validation and emails
- `base44/entities/` — database schemas: User, WaitlistSignup, PilotRequest, Expense, Budget, Goals, etc.
- `tests/money.test.mjs` — 20 unit tests for calculator and SIP maths

## Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TanStack Router, Tailwind CSS, shadcn/ui |
| Runtime | Base44 TanStack Start (Cloudflare Worker) |
| Database | Base44 entities with Row-Level Security (RLS) |
| Auth | Base44 auth (Google SSO, email/password, MFA) |
| Email | Base44 SendEmail integration |
| Deploy | Base44 editor 'Publish' or GitHub Actions → GitHub Pages |

## Run the tests

```bash
node tests/money.test.mjs
```

## Deployment

### Base44 (primary live host)
1. Publish the app from the Base44 editor (Publish button, top right).
2. Set the real domain in `src/config/site.js` (`site.url`) before publishing, so the canonical URL,
   Open Graph URL, `sitemap.xml` and `robots.txt` all point at it.
3. Verify the contact email, social links, and Grievance Officer details in `src/config/site.js`.
   These are legally required: Grievance Officer must be registered with the Ministry of Electronics and IT (MeitY).

### GitHub Pages (optional static mirror)
A GitHub Actions workflow (`.github/workflows/static.yml`) builds and deploys the client bundle
to GitHub Pages. The app's dynamic parts (databases, APIs, auth) remain on Base44.
- Triggers on push to `main` branch
- Serves the built `dist/client/` folder
- Ensure `site.url` in `src/config/site.js` matches your GitHub Pages custom domain if set.

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

## Pre-launch checklist

- [x] Contact email, social links, and Grievance Officer details verified in `src/config/site.js`
- [ ] Set real domain in `site.url` for production (`https://brokenomore.in` or YOURDOMAIN.com)
- [ ] Re-verify tax limits and section numbers against incometax.gov.in before filing season
- [ ] Set up Base44 secrets (email sending, if any custom tokens needed)
- [ ] Configure Google Analytics or other analytics in Base44 dashboard
- [ ] Test waitlist and pilot forms end-to-end after publish
- [ ] Verify `/robots.txt` and `/sitemap.xml` are accessible after publish
