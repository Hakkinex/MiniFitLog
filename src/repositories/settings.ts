import type { AppDatabase } from '../db/connection.js'

export function createSettingsRepository(db: AppDatabase) {
  return {
    get(userId: number, key: string): string | null {
      const row = db.prepare('SELECT value FROM app_settings WHERE user_id = ? AND key = ?').get(userId, key) as { value: string } | undefined
      return row ? row.value : null
    },

    set(userId: number, key: string, value: string) {
      db.prepare(
        `INSERT INTO app_settings (user_id, key, value) VALUES (?, ?, ?)
         ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
      ).run(userId, key, value)
    },

    getAll(userId: number) {
      return db.prepare('SELECT key, value FROM app_settings WHERE user_id = ?').all(userId) as { key: string; value: string }[]
    },
  }
}

export function createBmrCascadeRepository(db: AppDatabase) {
  return {
    cascadeForward(userId: number, fromDate: string, bmr: number) {
      db.prepare(
        `UPDATE weekly_bmr SET bmr = ?, updated_at = datetime('now') WHERE user_id = ? AND date >= ?`
      ).run(bmr, userId, fromDate)

      const existing = db.prepare('SELECT date FROM weekly_bmr WHERE user_id = ? AND date >= ? ORDER BY date').all(userId, fromDate) as { date: string }[]
      return existing
    },
  }
}
