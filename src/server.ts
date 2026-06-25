import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import { runMigrations } from './db/migrate.js'
import { createAuthService } from './services/auth.js'
import { createTrainingService } from './services/training.js'
import { createFoodService } from './services/food.js'
import { trainingRoutes } from './routes/training.js'
import { foodRoutes } from './routes/food.js'
import { authMiddleware } from './routes/auth.js'
import path from 'node:path'
import fs from 'node:fs'

const PORT = parseInt(process.env.PORT || '3000', 10)
const HOST = process.env.HOST || '0.0.0.0'

async function main() {
  const fastify = Fastify({ logger: true })

  await fastify.register(cookie)

  const db = runMigrations()
  const authService = createAuthService(db)
  const trainingService = createTrainingService(db)
  const foodService = createFoodService(db)

  await authMiddleware(fastify, authService)
  await fastify.register(trainingRoutes, trainingService)
  await fastify.register(foodRoutes, foodService)

  const publicDir = path.resolve(import.meta.dirname, '../public')
  if (fs.existsSync(publicDir)) {
    fastify.get('/', async (_req, reply) => {
      return reply.type('text/html').send(fs.readFileSync(path.join(publicDir, 'index.html'), 'utf-8'))
    })
    fastify.get('/login', async (_req, reply) => {
      const loginFile = path.join(publicDir, 'login.html')
      if (fs.existsSync(loginFile)) {
        return reply.type('text/html').send(fs.readFileSync(loginFile, 'utf-8'))
      }
      return reply.type('text/html').send('<h1>Login</h1>')
    })
  }

  try {
    await fastify.listen({ port: PORT, host: HOST })
    console.log(`Server running at http://${HOST}:${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main()
