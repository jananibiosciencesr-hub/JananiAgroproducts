# JANANI AGRO PRODUCTS — FULLSTACK E-COMMERCE PLATFORM

E-commerce storefront and admin command center for Janani Agro Products, built with React, TanStack Start, Vite and Tailwind CSS. The live API is PHP + MySQL on Hostinger.

---

## 📁 Workspace Structure

```
Janani Agro/
├── frontend/                 # Storefront + admin portal (TanStack Start, React 19, Vite, Tailwind)
│   ├── src/                  # Routes, components, API client (lib/api.ts, lib/http-auth.ts, lib/razorpay.ts)
│   ├── public/               # Static files + .htaccess (source of truth for the site's Apache rules)
│   └── scripts/sync-build.cjs  # Copies the production build into the site root (see "Deploying")
├── backend/
│   ├── php/                  # PRODUCTION API (single source of truth)
│   │   ├── api.php           # REST endpoints: /api.php?action=... and /api/<action>
│   │   ├── api_security.php  # Auth tokens, access policy, OTP, rate limits, pricing, Razorpay, migrations
│   │   └── db_init.php       # Schema setup (admin-only / CLI)
│   ├── src/                  # Express mock API for LOCAL DEVELOPMENT ONLY (refuses to run in production)
│   ├── database.sql          # Schema + catalogue seed (import via phpMyAdmin)
│   └── .env.example          # Environment template (copy to .env)
├── scratch/                  # Developer scripts (not committed)
└── (site root)               # Generated deploy output served by Hostinger: index.html, assets/, route
                              # folders, api.php, api_security.php, db_init.php, .htaccess
```

---

## 🔐 Production setup (Hostinger) — required

1. **Create the `.env` file outside the web root**, e.g. `/home/<user>/domains/jananiagroproducts.com/.env`
   (one level above `public_html`). Use `backend/.env.example` as the template. `api.php` reads it from
   there automatically. **No credentials are stored in the code any more.** Without this file the API
   runs in read-only catalogue mode and sign-in/checkout are disabled.
2. **Rotate every secret that was previously committed to git** (they are in the git history and must be
   considered public):
   - MySQL password (hPanel → Databases)
   - Gmail App Password (Google Account → Security → App passwords) → `SMTP_PASS`
   - Razorpay keys (Dashboard → API Keys, **live mode**) → `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
3. **Razorpay webhook**: Dashboard → Webhooks → URL
   `https://jananiagroproducts.com/api.php?action=razorpay-webhook`, events `payment.captured`,
   `order.paid`, `payment.failed`, secret → `RAZORPAY_WEBHOOK_SECRET`. This records an order even if the
   customer closes the browser right after paying.
4. **Admin sign-in** is by e-mail OTP to `ADMIN_EMAIL` (`/admin`). Passwords that were hardcoded in old
   versions were revoked automatically on first run.
5. Online payment is disabled (customers see "use Cash on Delivery") until valid **live** Razorpay keys
   are configured. Test keys are refused on the live site unless `RAZORPAY_ALLOW_TEST_MODE=true`.

### How security works now
- Every API request is authorised centrally (`janani_authorize_request`): public catalogue, customer
  self-service (own orders/profile only), staff and administrator endpoints.
- Sessions are HMAC-signed tokens issued only after password or OTP verification.
- OTPs are random, hashed, expire after 10 minutes and are destroyed after 5 wrong attempts; sending and
  verifying are rate limited.
- Prices, coupons, GST, shipping, stock and payment status are calculated on the server from the
  database. Razorpay payments are verified by signature before an order is recorded, exactly once.
- Refunds (customer cancellation, admin refund) go through the Razorpay refund API.
- Data is never rewritten on normal requests; schema/data fixes run once as versioned migrations.

---

## 🚀 Local development

```bash
npm run dev            # frontend (http://localhost:5173) + Express mock API (http://127.0.0.1:5000)
```
The Express mock API in `backend/src` is for local UI work only. Configure `backend/.env` from
`backend/.env.example` (set `DEV_ADMIN_PASSWORD` if you need the mock admin login).

---

## 📦 Deploying

```bash
npm run build          # builds the frontend, then runs frontend/scripts/sync-build.cjs
```
The sync step copies the new bundle into `assets/` (removing bundles from older builds), pre-renders
route HTML, and copies `backend/php/*.php` and `frontend/public/.htaccess` to the site root. Commit the
result; Hostinger deploys the repository root.

Never edit the root copies of `api.php`, `api_security.php`, `db_init.php` or `.htaccess` directly —
edit `backend/php/` or `frontend/public/.htaccess` and rebuild.
