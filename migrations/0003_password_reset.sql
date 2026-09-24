CREATE TABLE IF NOT EXISTS password_reset_codes (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reset_email ON password_reset_codes (email);
CREATE INDEX IF NOT EXISTS idx_reset_expires ON password_reset_codes (expires_at);
