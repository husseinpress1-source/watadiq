# Watad API — خادم وتد

الجزء الوحيد من المشروع الذي يحتاج سيرفر. باقي الموقع ستاتيك بالكامل (HTML/CSS/JS).

## الخدمات

| Endpoint | الوصف |
|---|---|
| `GET /api/health` | فحص حالة السيرفر |
| `GET /api/check-domain?name=example` | فحص توفر الدومين عبر 10 امتدادات (com, net, org, io, dev, co, iq, me, shop, store) |

## التشغيل محلياً

```bash
# من جذر المشروع
npm run api          # السيرفر على :3001
npm run dev          # الواجهة على :5173 (البروكسي يمرر /api تلقائياً)
```

## كيف يعمل الفحص

1. **RDAP** (سجلات ICANN الرسمية) — يُحمّل سجل IANA الكامل عند الإقلاع (1400+ امتداد)
2. **DNS-over-HTTPS** (Cloudflare + Google) — احتياطي للامتدادات بدون RDAP مثل `.iq`
3. **DNS عادي** — احتياطي أخير
4. **Cache** داخلي 5 دقائق + **Rate limit** (30 فحص/دقيقة لكل IP)

## النشر

الموقع الستاتيك يُنشر كالمعتاد (`npm run build` → مجلد `dist/`).
السيرفر يُنشر منفصلاً على أي استضافة Node (Render / Railway / VPS):

```bash
cd server
npm install
PORT=3001 ALLOWED_ORIGINS=https://watadiq.com node server.js
```

ثم وجّه `https://watadiq.com/api/` إلى السيرفر عبر reverse proxy (Nginx/Apache)،
أو انشره على ساب-دومين مثل `api.watadiq.com` وحدّث مسار الجلب في `src/lib/domains.ts`.

## متغيرات البيئة

| المتغير | الافتراضي | الوصف |
|---|---|---|
| `PORT` | `3001` | منفذ السيرفر |
| `ALLOWED_ORIGINS` | localhost + watadiq.com | نطاقات CORS المسموحة |
