-- アクセスカウンター用の D1 データベース（yonu-work-counter）の表。
-- 作り直すとき: npx wrangler d1 execute yonu-work-counter --remote --file=db/schema.sql
-- （何度実行しても、すでにある数は消えない）
CREATE TABLE IF NOT EXISTS counters (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO counters (name, value) VALUES ('visits', 0);
