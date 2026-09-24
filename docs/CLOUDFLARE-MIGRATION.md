# نقل watadiq.com من Vercel إلى Cloudflare Pages (Workers)

## 1) حساب Cloudflare الصحيح (hswttt553@gmail.com)

### الطريقة أ — OAuth (Wrangler)

**مهم:** استخدم المنفذ **8976** فقط. أي منفذ آخر يعطي `redirect_uri does not match`.

```bash
npx wrangler logout
npx wrangler login --callback-port 8976 --browser=false
```

انسخ رابط **Visit this link** كاملاً (سطر واحد طويل) وافتحه في **Chrome/Edge على نفس الجهاز** — ليس من متصفح Cursor.  
بعد الموافقة يظهر «Success» على `localhost:8976`.

```bash
npx wrangler whoami
```

### الطريقة ب — API Token (إذا OAuth يعلق)

1. [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) (مسجّل كـ hswttt553@gmail.com)
2. **Create Token** → قالب **Edit Cloudflare Workers**
3. في PowerShell (مرة واحدة):

```powershell
$env:CLOUDFLARE_API_TOKEN = "الصق_التوكن_هنا"
$env:CLOUDFLARE_ACCOUNT_ID = "من Overview في Dashboard → Account ID"
npm run deploy:cf
```

لا ترفع التوكن إلى GitHub.

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

**تم إضافة:** `watadiq.com` و `www.watadiq.com` على مشروع **watadiq** (حساب hswttt553).

**هدف DNS (Pages):** `watadiq-cpk.pages.dev`

النطاق حالياً يشير إلى **Vercel** (`www` → `vercel-dns`, الجذر → IPs فيرسل). لازم تغيّر DNS:

| النوع | الاسم | القيمة |
|--------|--------|--------|
| CNAME | `www` | `watadiq-cpk.pages.dev` |
| CNAME أو ALIAS | `@` / `watadiq.com` | `watadiq-cpk.pages.dev` |

**الأفضل:** [Add a site](https://dash.cloudflare.com/add-site) → `watadiq.com` → غيّر **Nameservers** عند الم registrar → Cloudflare يضبط DNS + SSL تلقائياً.

Dashboard: [Custom domains — watadiq](https://dash.cloudflare.com/9c38ce40f0f7dfe15ce00ab421a3ba86/pages/view/watadiq/domains)

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
