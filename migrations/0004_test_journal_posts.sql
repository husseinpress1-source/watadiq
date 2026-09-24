-- Deprecated: test posts removed in 0005_remove_test_journal_posts.sql
DELETE FROM posts WHERE id LIKE 'test_journal_%';

-- (legacy seed removed — do not re-insert test posts)
/*
INSERT INTO posts (
  id, slug, status, published_at, cover_image, reading_time_min, author_name, tags,
  title_en, title_ar, excerpt_en, excerpt_ar, body_en, body_ar
) VALUES
(
  'test_journal_01',
  'test-journal-edge-delivery',
  'published',
  '2026-03-24T09:00:00.000Z',
  '/images/home/highlight-1.jpg',
  4,
  'WATAD Software',
  '["Test","Engineering"]',
  '[Test] Faster pages at the edge',
  '[تجربة] صفحات أسرع على الـ edge',
  'A short note on why we ship static builds close to readers.',
  'ملاحظة قصيرة عن سبب نشر البناء الثابت قرب القارئ.',
  '<p>This is a temporary test article for the journal grid.</p><p>We use it to check mobile layout and typography before real stories go live.</p>',
  '<p>هذا مقال تجريبي مؤقت لشبكة المجلة.</p><p>نستخدمه للتحقق من عرض الجوال والخط قبل نشر مقالات حقيقية.</p>'
),
(
  'test_journal_02',
  'test-journal-product-notes',
  'published',
  '2026-03-23T09:00:00.000Z',
  '/images/home/highlight-2.jpg',
  5,
  'WATAD Software',
  '["Test","Product"]',
  '[Test] Product notes from the studio',
  '[تجربة] ملاحظات منتج من الاستوديو',
  'How we write specs before a single screen is designed.',
  'كيف نكتب المواصفات قبل رسم أول شاشة.',
  '<p>Test post two. Product teams need a shared vocabulary.</p><p>This card should sit beside its neighbor on mobile.</p>',
  '<p>منشور تجريبي ثانٍ. فرق المنتج تحتاج لغة مشتركة.</p><p>يجب أن تظهر هذه البطاقة بجانب جارتها على الجوال.</p>'
),
(
  'test_journal_03',
  'test-journal-security-habits',
  'published',
  '2026-03-22T09:00:00.000Z',
  '/images/home/highlight-3.jpg',
  6,
  'WATAD Software',
  '["Test","Security"]',
  '[Test] Security habits we keep',
  '[تجربة] عادات أمان نلتزم بها',
  'Small checks that save large incidents later.',
  'فحوصات بسيطة تمنع حوادث كبيرة لاحقاً.',
  '<p>Test post three. Rotate keys, limit access, log changes.</p><p>Delete this batch when review is finished.</p>',
  '<p>منشور تجريبي ثالث. تجديد المفاتيح، تقليل الصلاحيات، توثيق التغييرات.</p><p>احذف هذه المجموعة بعد انتهاء المراجعة.</p>'
),
(
  'test_journal_04',
  'test-journal-cloud-ops',
  'published',
  '2026-03-21T09:00:00.000Z',
  '/images/home/promo-story.webp',
  4,
  'WATAD Software',
  '["Test","Cloud"]',
  '[Test] Cloud ops without drama',
  '[تجربة] تشغيل سحابي بلا تعقيد',
  'Deployments should be boring. That is the goal.',
  'النشر يجب أن يكون مملاً. هذا هو الهدف.',
  '<p>Test post four. Pipelines, previews, rollbacks.</p><p>Four cards, two columns, two rows on phones.</p>',
  '<p>منشور تجريبي رابع. مسارات نشر، معاينات، تراجع.</p><p>أربع بطاقات، عمودان، سطران على الهاتف.</p>'
);
*/
