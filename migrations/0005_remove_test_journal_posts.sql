-- Remove temporary journal test posts (see 0004_test_journal_posts.sql)
DELETE FROM posts WHERE id LIKE 'test_journal_%';
DELETE FROM posts WHERE slug LIKE 'test-journal-%';
