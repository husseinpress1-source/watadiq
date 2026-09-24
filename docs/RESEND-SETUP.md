# Resend email (welcome + password reset)

WATAD uses [Resend](https://resend.com) for transactional mail: welcome on sign-up and a **6-digit code** when someone uses **Forgot password**.

## 1. API key

1. Sign in at [resend.com](https://resend.com).
2. **API Keys** → **Create API Key** (Sending access is enough).
3. Copy the key (`re_...`). You will not see it again.

## 2. Verified domain (watadiq.com)

You already linked the domain in Resend. Confirm status is **Verified** (DNS records green).

Pick a sender address on that domain, for example:

- `WATAD Software <noreply@watadiq.com>`
- or `hello@watadiq.com`

That full string is **`RESEND_FROM`**.

## 3. Cloudflare Pages (production)

**Workers & Pages** → project **watadiq** → **Settings** → **Environment variables** → **Production**:

| Name | Type | Example |
|------|------|---------|
| `RESEND_API_KEY` | Secret | `re_xxxxxxxx` |
| `RESEND_FROM` | Variable or secret | `WATAD Software <noreply@watadiq.com>` |

Redeploy after saving (or push a deploy) so Functions pick up the secrets.

Also ensure D1 migration **`0003_password_reset.sql`** is applied:

```bash
npm run db:migrate:remote
```

## 4. Local dev

Create or update `.env` in the project root (do not commit):

```env
RESEND_API_KEY=re_...
RESEND_FROM=WATAD Software <noreply@watadiq.com>
```

Run the API with `npm run api`. If `RESEND_API_KEY` is missing, the dev server still accepts forgot-password and **prints the 6-digit code in the terminal** for testing.

## 5. User flow

1. **Sign in** → **Forgot your password?** → `/account/forgot`
2. Enter email → Resend sends code (15 min TTL)
3. `/account/reset?email=...` → code + new password → redirect to sign in

Production returns a generic success even when the email is unknown (no account enumeration).
