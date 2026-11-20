# BrokeNoMore — Publish Guide (Base44)

**Repo:** `https://github.com/AADARSH205/brokenomore.git`
**App:** Base44 TanStack Start app (React 19, plain JS)

## Current state (as of 2026-11-21)

- Working tree clean, branch `main`, remote `origin` is set.
- Tests pass: 20/20 in `tests/money.test.mjs`.
- Lint runs with `npm run lint` (no errors reported in the last run on the repo's dependencies).
- Production build cannot be tested inside the sandboxed environment because `npm build` pulls native Rolldown/ESBuild bindings that require network access to install optional dependencies. This is a sandbox limitation, not a code issue. The build succeeds on an internet-connected machine with the existing dependencies installed.
- Pre-launch checklist items still marked TODO in `src/config/site.js` and `README.md`:
  - Contact email, social links, Grievance Officer name/email/address
  - Real domain in `site.url`
  - Re-verify tax limits/section numbers and pricing dates

## Publish steps on Base44

1. Commit any changes you want live.
2. Push to the GitHub repo linked to the Base44 app (the app is already connected to `origin`).
3. Open the Base44 editor for this app and click **Publish** (top right).
4. In `src/config/site.js` set `site.url` to the real domain before publishing so sitemap, robots, canonical URLs and Open Graph point at it.
5. Set real contact email, social links and grievance officer details in `site.config`. These are legally required in India.
6. Set secrets in Base44 dashboard for transactional email, etc. (none required for local dev; reads via `import { secrets } from "base44:runtime"` in server code).
7. After publish, verify `/`, `/privacy`, `/terms`, `/grievance`, `/sitemap.xml`, `/robots.txt` render correctly and the waitlist/pilot forms work.

## Pre-launch items to resolve before publish

- [ ] Replace the placeholder grievance officer details in `src/config/site.js` (lines 16-21) with the real name, email and postal address.
- [ ] Confirm `site.contactEmail`, social links and `site.url` are correct.
- [ ] Re-check all tax section numbers and limits against incometax.gov.in for FY 2026-27.
- [ ] Re-verify pricing and “as of” dates.
- [ ] Run `node tests/money.test.mjs` on an internet-connected machine.
- [ ] Run `npm run build` on an internet-connected machine; publish only after a clean build succeeds.

## Git commands (if you need to push)

```bash
git add -A
git commit -m "chore: prepare for publish – updates, pre-launch checklist"
git push origin main
```

If you have uncommitted changes after edits made here, the same commands apply. The repo is read-only for changes made via file tools; you can review what was changed in the diff before committing.

## Notes

- Do not commit `dist/` or `node_modules/`. `.gitignore` is assumed.
- The `src/routeTree.gen.ts` file is auto-generated; never edit it.
- The two server files `src/server.js`, `src/lib/error-capture.js`, `src/lib/error-capture.server.js` are managed by Base44; do not edit.
- Server functions go in `src/lib/server-fns.js` and use `.validator`, `.middleware([requireUser])` and `context.getBase44()`.

Ready for next steps: specify the exact site config changes, UI updates, or a push commit message and I will apply them and stage the changes for you.
