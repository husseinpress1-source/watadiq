# WATAD ONE on the company site (wadd)

**WATAD ONE** is the identity platform built in Go (`watad-one`). It runs **inside watadiq.com** under `/pass/*` — same site, same header tab — not a separate product domain.

## Architecture

```
watadiq.com/pass/*     → wadd (React) — UI: login, account, consent, developer console
api.watadiq.com        → watad-one identity server (Go) — API only
```

The Next.js apps in `watad-one/apps/web` are **not** deployed separately in production. Their flows are implemented in wadd pages that call the Go API.

## Routes (all on watadiq.com)

| Path | Purpose |
|------|---------|
| `/pass` | Platform overview |
| `/pass/login` | Email OTP + Passkey |
| `/pass/account` | Connected apps, passkeys |
| `/pass/console` | Developer console (orgs, apps, redirects) |
| `/pass/developers` | Integration guide |
| `/pass/consent` | OAuth consent screen |
| `/login`, `/consent` | Aliases for identity server redirects (`WEB_URL=https://watadiq.com`) |

Domain orders remain at `/account/*` (separate Express API).

## Local dev

1. Identity: `watad-one` → `localhost:8080` (codes print in server logs — dev fallback)
2. wadd: `npm run dev` → Vite (proxies `/identity-api` → 8080)

## Email delivery (Resend)

Codes print in server logs only while `APP_ENV=development`. For real email:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxx
SMTP_FROM=WATAD ONE <no-reply@watadiq.com>
```

Uses the Resend HTTPS API — no SMTP ports required (works on VPSs that block 465/587).
Add and verify `watadiq.com` in the Resend dashboard first (SPF/DKIM records).

## Production env (identity)

```env
WEB_URL=https://watadiq.com
WEBAUTHN_RP_ID=watadiq.com
WEBAUTHN_RP_ORIGIN=https://watadiq.com
COOKIE_DOMAIN=watadiq.com
CORS_ORIGINS=https://watadiq.com
```

OAuth login/consent redirects hit `/login` and `/consent` on the main site.

## Key wadd files

- `src/lib/watad-pass.ts` — API client
- `src/components/PassPlatformNav.tsx` — in-site platform tabs
- `src/pages/pass/*` — platform UI
