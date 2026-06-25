import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { AppDatabase } from '../db/connection.js'
import { createAuthSessionsRepository, createUserDataOwnershipRepository, createUsersRepository, type SessionUserRow } from '../repositories/auth.js'
import { ok, err, type Result } from '../lib/result.js'

export type AppError = { status: number; message: string }
export type AuthService = ReturnType<typeof createAuthService>

const SESSION_DAYS = 30

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex')
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = Buffer.from(hashPassword(password, salt), 'hex')
  const stored = Buffer.from(storedHash, 'hex')
  if (hash.length !== stored.length) return false
  return timingSafeEqual(hash, stored)
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function sessionExpiry(): string {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  return expires.toISOString().slice(0, 19).replace('T', ' ')
}

export function createAuthService(db: AppDatabase) {
  const usersRepo = createUsersRepository(db)
  const sessionsRepo = createAuthSessionsRepository(db)
  const ownershipRepo = createUserDataOwnershipRepository(db)

  function createSession(userId: number) {
    sessionsRepo.deleteExpired()
    const token = randomBytes(32).toString('hex')
    sessionsRepo.create(userId, hashToken(token), sessionExpiry())
    return token
  }

  return {
    hasUsers() {
      return usersRepo.count() > 0
    },

    register(email: string, password: string): Result<{ user: SessionUserRow; token: string }, AppError> {
      const existing = usersRepo.getByEmail(email)
      if (existing) return err({ status: 409, message: 'Email already registered' })

      try {
        const salt = randomBytes(16).toString('hex')
        const user = usersRepo.create(email, hashPassword(password, salt), salt)
        ownershipRepo.initializeForUser(user.id)
        return ok({ user, token: createSession(user.id) })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    login(email: string, password: string): Result<{ user: SessionUserRow; token: string }, AppError> {
      const user = usersRepo.getByEmail(email)
      if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
        return err({ status: 401, message: 'Invalid email or password' })
      }
      return ok({ user: { id: user.id, email: user.email }, token: createSession(user.id) })
    },

    getUserByToken(token: string): SessionUserRow | null {
      return sessionsRepo.getUserByTokenHash(hashToken(token)) || null
    },

    logout(token: string) {
      sessionsRepo.deleteByTokenHash(hashToken(token))
      return { ok: true }
    },
  }
}
