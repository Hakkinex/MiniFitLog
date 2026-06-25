import type { AppDatabase } from '../db/connection.js'

export type UserRow = {
  id: number
  email: string
  password_hash: string
  password_salt: string
}

export type SessionUserRow = {
  id: number
  email: string
}

export function createUsersRepository(db: AppDatabase) {
  return {
    count() {
      const row = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }
      return row.count
    },

    getByEmail(email: string) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined
    },

    create(email: string, passwordHash: string, passwordSalt: string) {
      const result = db
        .prepare(
          `INSERT INTO users (email, password_hash, password_salt)
           VALUES (?, ?, ?)`
        )
        .run(email, passwordHash, passwordSalt)
      return db.prepare('SELECT id, email FROM users WHERE id = ?').get(result.lastInsertRowid) as SessionUserRow
    },
  }
}

export function createUserDataOwnershipRepository(db: AppDatabase) {
  return {
    initializeForUser(userId: number) {
      const tx = db.transaction((id: number) => {
        db.prepare('UPDATE weekly_metrics SET user_id = ? WHERE user_id IS NULL').run(id)
        db.prepare('UPDATE daily_records SET user_id = ? WHERE user_id IS NULL').run(id)
        db.prepare('UPDATE food_items SET user_id = ? WHERE user_id IS NULL').run(id)
        db.prepare('UPDATE meal_records SET user_id = ? WHERE user_id IS NULL').run(id)
        db.prepare('UPDATE weekly_bmr SET user_id = ? WHERE user_id IS NULL').run(id)
        db.prepare('UPDATE app_settings SET user_id = ? WHERE user_id IS NULL').run(id)
        db.prepare(
          `INSERT OR IGNORE INTO app_settings (user_id, key, value)
           VALUES (?, 'bmr_default', '10283')`
        ).run(id)
        db.prepare(
          `INSERT OR IGNORE INTO app_settings (user_id, key, value)
           VALUES (?, 'deficit_start_date', '')`
        ).run(id)
      })
      tx(userId)
    },
  }
}

export function createAuthSessionsRepository(db: AppDatabase) {
  return {
    create(userId: number, tokenHash: string, expiresAt: string) {
      db.prepare(
        `INSERT INTO auth_sessions (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)`
      ).run(userId, tokenHash, expiresAt)
    },

    getUserByTokenHash(tokenHash: string) {
      return db
        .prepare(
          `SELECT users.id, users.email
           FROM auth_sessions
           JOIN users ON users.id = auth_sessions.user_id
           WHERE auth_sessions.token_hash = ?
             AND auth_sessions.expires_at > datetime('now')`
        )
        .get(tokenHash) as SessionUserRow | undefined
    },

    deleteByTokenHash(tokenHash: string) {
      db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(tokenHash)
    },

    deleteExpired() {
      db.prepare("DELETE FROM auth_sessions WHERE expires_at <= datetime('now')").run()
    },
  }
}
