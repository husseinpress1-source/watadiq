# Blog + D1 on Cloudflare Pages

## One-time setup

1. Log in (OAuth must use port **8976** if Wrangler opens localhost):

   ```bash
   npx wrangler login
   ```

2. Create the database:

   ```bash
   npx wrangler d1 create watadiq-blog
   ```

3. Copy the `database_id` from the command output into `wrangler.toml` (`[[d1_databases]]` → `database_id`).

4. Apply migrations (schema + 3 seed articles):

   ```bash
   npm run db:migrate:remote
   ```

5. Optional — enable HTTP publishing (admin API):

   - Cloudflare Dashboard → **Workers & Pages** → **watadiq** → **Settings** → **Environment variables**
   - Add secret **`BLOG_ADMIN_SECRET`** (production)
   - Publish with:

     ```bash
     curl -X POST https://watadiq.com/api/blog/admin/posts \
       -H "Authorization: Bearer YOUR_SECRET" \
       -H "Content-Type: application/json" \
       -d "{\"slug\":\"my-post\",\"titleEn\":\"...\",\"titleAr\":\"...\",\"excerptEn\":\"...\",\"excerptAr\":\"...\",\"bodyEn\":\"<p>...</p>\",\"bodyAr\":\"<p>...</p>\"}"
     ```

## Deploy

```bash
npm run deploy:cf
```

Pages serves the React app from `dist/` and runs `functions/` at the edge with the **DB** binding.

## Local dev

- `npm run dev` — blog API is mocked from `src/data/blogDevSeed.ts` at `/api/blog/*`.
- `npm run pages:dev` — full stack with Wrangler + local D1 (after `npm run db:migrate:local`).

## Routes

| URL | Description |
|-----|-------------|
| `/blog` | Index |
| `/blog/:slug` | Article |
| `GET /api/blog/posts` | JSON list |
| `GET /api/blog/posts/:slug` | JSON article |
| `POST /api/blog/admin/posts` | Upsert (requires `BLOG_ADMIN_SECRET`) |
