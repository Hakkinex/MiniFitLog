import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
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
    await authMiddleware(fastify, createAuthService(db))
    fastify.get('/api/private', async () => ({ ok: true }))

    const response = await fastify.inject({ method: 'GET', url: '/api/private' })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ error: 'Unauthorized' })
    await fastify.close()
  })
})
