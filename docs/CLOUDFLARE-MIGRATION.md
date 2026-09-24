# نقل watadiq.com من Vercel إلى Cloudflare Pages (Workers)

## 1) حساب Cloudflare الصحيح

على الجهاز:

```bash
npx wrangler logout
npx wrangler login
```

سجّل بحساب **hswttt553@gmail.com** (أو الحساب الذي فيه نطاق `watadiq.com`).

تحقق:

```bash
npx wrangler whoami
```

## 2) نشر يدوي

```bash
npm run deploy:cf
```

## 3) ربط GitHub (اختياري)

في GitHub → **Settings → Secrets → Actions**:

| Secret | القيمة |
|--------|--------|
| `CLOUDFLARE_API_TOKEN` | Token من Cloudflare Dashboard → My Profile → API Tokens (قالب **Edit Cloudflare Workers**) |
| `CLOUDFLARE_ACCOUNT_ID` | من `wrangler whoami` أو Overview في Dashboard |

كل push على `main` ينشر تلقائياً (workflow: `.github/workflows/cloudflare-pages.yml`).

## 4) ربط النطاق في Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → مشروع **watadiq**
2. **Custom domains** → أضف `watadiq.com` و `www.watadiq.com`
3. إذا النطاق أصلاً على Cloudflare DNS، سجّل الـ CNAME تلقائياً

## 5) إلغاء Vercel (بعد ما يشتغل الموقع على Cloudflare)

1. [vercel.com](https://vercel.com) → مشروع watadiq
2. **Settings → Domains** → احذف `watadiq.com` و `www.watadiq.com`
3. (اختياري) **Settings → General → Delete Project** إذا ما تريد Vercel نهائياً

## 6) DNS (إذا النطاق على Cloudflare)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` أو `watadiq.com` | `watadiq.pages.dev` (أو ما يظهر في Pages) | Proxied |
| CNAME | `www` | `watadiq.pages.dev` | Proxied |

توجيه `www` → `watadiq.com` مضبوط في `public/_redirects`.

## 7) API محلي (اختياري)

`npm run api` يبقى على جهازك/سيرفر منفصل — **ما** ينشر مع Pages. نماذج التواصل تعمل عبر `server/` إذا ربطتها لاحقاً بـ Worker أو خدمة أخرى.
