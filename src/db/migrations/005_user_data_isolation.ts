export const MIGRATION_005 = `
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS weekly_metrics_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  date TEXT NOT NULL,
  body_fat REAL,
  weight REAL,
  waist REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

INSERT INTO weekly_metrics_new (id, user_id, date, body_fat, weight, waist, created_at, updated_at)
SELECT id, NULL, date, body_fat, weight, waist, created_at, updated_at FROM weekly_metrics;

DROP TABLE weekly_metrics;
ALTER TABLE weekly_metrics_new RENAME TO weekly_metrics;

CREATE TABLE IF NOT EXISTS daily_records_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  date TEXT NOT NULL,
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
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

INSERT INTO daily_records_new (id, user_id, date, exercise_type, exercise_custom, cardio_done, cardio_heartbeat, plank_done, plank_heartbeat, plank_type, plank_custom, note, created_at, updated_at)
SELECT id, NULL, date, exercise_type, exercise_custom, cardio_done, cardio_heartbeat, plank_done, plank_heartbeat, plank_type, plank_custom, note, created_at, updated_at FROM daily_records;

DROP TABLE daily_records;
ALTER TABLE daily_records_new RENAME TO daily_records;

CREATE TABLE IF NOT EXISTS food_items_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  source TEXT NOT NULL,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO food_items_new (id, user_id, source, name, calories, protein, notes, created_at, updated_at)
SELECT id, NULL, source, name, calories, protein, notes, created_at, updated_at FROM food_items;

DROP TABLE food_items;
ALTER TABLE food_items_new RENAME TO food_items;

CREATE TABLE IF NOT EXISTS meal_records_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner')),
  food_item_id INTEGER,
  custom_name TEXT,
  custom_calories REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE SET NULL
);

INSERT INTO meal_records_new (id, user_id, date, meal_type, food_item_id, custom_name, custom_calories, sort_order, created_at, updated_at)
SELECT id, NULL, date, meal_type, food_item_id, custom_name, custom_calories, sort_order, created_at, updated_at FROM meal_records;

DROP TABLE meal_records;
ALTER TABLE meal_records_new RENAME TO meal_records;

CREATE TABLE IF NOT EXISTS weekly_bmr_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  date TEXT NOT NULL,
  bmr REAL NOT NULL,
  deficit REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

INSERT INTO weekly_bmr_new (id, user_id, date, bmr, deficit, created_at, updated_at)
SELECT id, NULL, date, bmr, deficit, created_at, updated_at FROM weekly_bmr;

DROP TABLE weekly_bmr;
ALTER TABLE weekly_bmr_new RENAME TO weekly_bmr;

CREATE TABLE IF NOT EXISTS app_settings_new (
  user_id INTEGER,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, key)
);

INSERT INTO app_settings_new (user_id, key, value, updated_at)
SELECT NULL, key, value, updated_at FROM app_settings;

DROP TABLE app_settings;
ALTER TABLE app_settings_new RENAME TO app_settings;

CREATE INDEX IF NOT EXISTS idx_weekly_metrics_user_date ON weekly_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_items_user_source ON food_items(user_id, source);
CREATE INDEX IF NOT EXISTS idx_meal_records_user_date ON meal_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_records_user_date_meal ON meal_records(user_id, date, meal_type);
CREATE INDEX IF NOT EXISTS idx_weekly_bmr_user_date ON weekly_bmr(user_id, date);
CREATE INDEX IF NOT EXISTS idx_app_settings_user_key ON app_settings(user_id, key);

PRAGMA foreign_keys = ON;
`
