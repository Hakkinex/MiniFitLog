import { createDatabase, type AppDatabase } from './connection.js'
import { MIGRATION_001 } from './migrations/001_initial.js'
import { MIGRATION_002 } from './migrations/002_food_tracking.js'
import { MIGRATION_003 } from './migrations/003_settings.js'
import { MIGRATION_004 } from './migrations/004_user_auth.js'
import { MIGRATION_005 } from './migrations/005_user_data_isolation.js'

const MIGRATIONS = [MIGRATION_001, MIGRATION_002, MIGRATION_003, MIGRATION_004, MIGRATION_005]

export function runMigrations(db?: AppDatabase): AppDatabase {
  const database = db || createDatabase()

  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const applied = database
    .prepare('SELECT name FROM _migrations')
    .all()
    .map((r: any) => r.name)

  const migrationNames = ['001_initial', '002_food_tracking', '003_settings', '004_user_auth', '005_user_data_isolation']

  for (let i = 0; i < MIGRATIONS.length; i++) {
    const name = migrationNames[i]
    if (!applied.includes(name)) {
      database.exec(MIGRATIONS[i])
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(name)
    }
  }

  return database
}
