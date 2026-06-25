import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../src/db/migrate.js'
import { createAuthService } from '../src/services/auth.js'

let db: Database.Database

beforeEach(() => {
  db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
})

afterEach(() => {
  db.close()
})

describe('Auth Service', () => {
  it('should register a user and create a valid session', () => {
    const service = createAuthService(db)

    const result = service.register('user@example.com', 'password123')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.user.email).toBe('user@example.com')
    expect(result.value.token.length).toBeGreaterThan(20)
    expect(service.getUserByToken(result.value.token)?.email).toBe('user@example.com')
  })

  it('should login with registered credentials', () => {
    const service = createAuthService(db)

    service.register('user@example.com', 'password123')
    const result = service.login('user@example.com', 'password123')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.user.email).toBe('user@example.com')
  })

  it('should reject invalid credentials', () => {
    const service = createAuthService(db)

    service.register('user@example.com', 'password123')
    const result = service.login('user@example.com', 'wrong-password')

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.status).toBe(401)
  })

  it('should logout a session', () => {
    const service = createAuthService(db)

    const registered = service.register('user@example.com', 'password123')
    if (!registered.ok) throw new Error('registration failed')

    service.logout(registered.value.token)

    expect(service.getUserByToken(registered.value.token)).toBeNull()
  })
})
