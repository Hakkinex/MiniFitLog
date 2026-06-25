import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import Database from 'better-sqlite3'
import { runMigrations } from '../src/db/migrate.js'
import { createAuthService } from '../src/services/auth.js'
import { createTrainingService } from '../src/services/training.js'
import { createFoodService } from '../src/services/food.js'
import { authMiddleware } from '../src/routes/auth.js'
import { trainingRoutes } from '../src/routes/training.js'
import { foodRoutes } from '../src/routes/food.js'

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

async function buildApp() {
  const fastify = Fastify()
  await fastify.register(cookie)
  await fastify.register(rateLimit, { global: false })

  const authService = createAuthService(db)
  const trainingService = createTrainingService(db)
  const foodService = createFoodService(db)

  await authMiddleware(fastify, authService)
  await fastify.register(trainingRoutes, trainingService)
  await fastify.register(foodRoutes, foodService)

  return { fastify, authService }
}

async function registerAndGetCookie(fastify: Fastify.FastifyInstance) {
  const response = await fastify.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email: 'user@example.com', password: 'password123' },
  })

  const setCookie = response.headers['set-cookie']
  if (!setCookie) throw new Error('missing set-cookie header')
  return Array.isArray(setCookie) ? setCookie[0] : setCookie
}

describe('Route validation', () => {
  it('should reject invalid import payloads', async () => {
    const { fastify } = await buildApp()
    const cookieHeader = await registerAndGetCookie(fastify)

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/import',
      headers: { cookie: cookieHeader },
      payload: {
        metrics: [{ date: 'bad-date', body_fat: 500 }],
        records: [],
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Invalid body')
    await fastify.close()
  })

  it('should reject oversized food search queries', async () => {
    const { fastify } = await buildApp()
    const cookieHeader = await registerAndGetCookie(fastify)

    const response = await fastify.inject({
      method: 'GET',
      url: `/api/foods/search?q=${'a'.repeat(101)}`,
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Invalid query')
    await fastify.close()
  })

  it('should reject invalid settings keys', async () => {
    const { fastify } = await buildApp()
    const cookieHeader = await registerAndGetCookie(fastify)

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/settings/../../bad-key',
      headers: { cookie: cookieHeader },
    })

    expect(response.statusCode).toBe(404)
    await fastify.close()
  })

  it('should reject invalid settings update keys', async () => {
    const { fastify } = await buildApp()
    const cookieHeader = await registerAndGetCookie(fastify)

    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/settings',
      headers: { cookie: cookieHeader },
      payload: { key: 'bad key', value: 'x' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('Invalid body')
    await fastify.close()
  })
})
