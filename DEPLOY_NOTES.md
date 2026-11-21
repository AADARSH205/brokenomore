# BrokeNoMore — Fresh Base44 Import Guide

**Repo:** `https://github.com/AADARSH205/brokenomore.git`
**App:** Base44 TanStack Start app (React 19, plain JS)

## For creating a fresh Base44 project with your account

### 1. Base44 Dashboard Setup
1. Go to `app.base44.com` and log in with your account (`aadarshpatil89@gmail.com`)
2. Click "Create App" → "Import from GitHub"
3. Enter the repo URL: `https://github.com/AADARSH205/brokenomore.git`
4. Base44 will clone and set up the app with you as owner

### 2. Update domain (if needed)
The `site.url` in `src/config/site.js` is currently set to `https://localhost:5173` for local development. After Base44 creates the project:
- Update `src/config/site.js` → `url` to your real domain (e.g., `https://brokenomore.in`)
- Update `site.contactEmail`, `site.grievance` details as needed
- Run `npm run build` in the Base44 editor's terminal or use the UI deploy button

### 3. Existing Changes
- Fixed GitHub Actions workflow to build/deploy correctly
- Updated README.md with deployment instructions
- All source files intact for fresh import

## Key files structure

- `src/config/site.js` — site details, contact email, socials, grievance officer
- `base44/entities/` — database schemas (User, WaitlistSignup, PilotRequest, etc.)
- `src/lib/server-fns.js` — backend logic for forms
- `src/routes/` — pages (index.jsx is home page)
- `tests/money.test.mjs` — 20 tests pass

## Pre-launch checklist items

**After importing, update these in `src/config/site.js`:**
- [ ] `site.url` — your real domain
- [ ] `site.contactEmail` — support email
- [ ] `site.socs` — your Instagram, LinkedIn, X links
- [ ] `site.grievance` — Grievance Officer name, email, address (India legal requirement)

## Publishing

1. Make sure domain is set correctly in `site.url`
2. Click **Publish** button in Base44 editor (top right)
3. Verify the deployed site at the configured domain