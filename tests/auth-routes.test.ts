import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import Database from 'better-sqlite3'
import { runMigrations } from '../src/db/migrate.js'
import { createAuthService } from '../src/services/auth.js'
import { authMiddleware } from '../src/routes/auth.js'

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

describe('Auth Routes', () => {
  it('should redirect unauthenticated page requests to login', async () => {
    const fastify = Fastify()
    await fastify.register(cookie)
    await fastify.register(rateLimit, { global: false })
    await authMiddleware(fastify, createAuthService(db))
    fastify.get('/', async () => 'home')

    const response = await fastify.inject({ method: 'GET', url: '/' })

    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/login')
    await fastify.close()
  })

  it('should reject unauthenticated api requests', async () => {
    const fastify = Fastify()
    await fastify.register(cookie)
    await fastify.register(rateLimit, { global: false })
    await authMiddleware(fastify, createAuthService(db))
    fastify.get('/api/private', async () => ({ ok: true }))

    const response = await fastify.inject({ method: 'GET', url: '/api/private' })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ error: 'Unauthorized' })
    await fastify.close()
  })

  it('should set secure auth cookie attributes on register', async () => {
    const fastify = Fastify()
    await fastify.register(cookie)
    await fastify.register(rateLimit, { global: false })
    await authMiddleware(fastify, createAuthService(db))

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'user@example.com', password: 'password123' },
    })

    expect(response.statusCode).toBe(200)
    const setCookie = response.headers['set-cookie']
    expect(setCookie).toBeTruthy()
    const header = Array.isArray(setCookie) ? setCookie[0] : setCookie
    expect(header).toContain('HttpOnly')
    expect(header).toContain('SameSite=Strict')
    expect(header).toContain('Path=/')
    await fastify.close()
  })

  it('should rate limit repeated login attempts', async () => {
    const fastify = Fastify()
    await fastify.register(cookie)
    await fastify.register(rateLimit, { global: false })
    const service = createAuthService(db)
    await authMiddleware(fastify, service)

    service.register('user@example.com', 'password123')

    for (let i = 0; i < 10; i++) {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'user@example.com', password: 'wrong-password' },
      })

      expect(response.statusCode).toBe(401)
    }

    const limited = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'user@example.com', password: 'wrong-password' },
    })

    expect(limited.statusCode).toBe(429)
    await fastify.close()
  })
})
