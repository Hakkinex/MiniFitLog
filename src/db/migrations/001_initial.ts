export const MIGRATION_001 = `
CREATE TABLE IF NOT EXISTS weekly_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  body_fat REAL,
  weight REAL,
  waist REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  exercise_type TEXT,
  exercise_custom TEXT,
  cardio_done INTEGER NOT NULL DEFAULT 0,
  cardio_heartbeat INTEGER,
  plank_done INTEGER NOT NULL DEFAULT 0,
  plank_heartbeat INTEGER,
  plank_type TEXT,
  plank_custom TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_weekly_metrics_date ON weekly_metrics(date);
CREATE INDEX IF NOT EXISTS idx_daily_records_date ON daily_records(date);
`
