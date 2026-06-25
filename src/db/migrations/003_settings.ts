export const MIGRATION_003 = `
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_settings (key, value) VALUES ('bmr_default', '10283');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('deficit_start_date', '');
`
