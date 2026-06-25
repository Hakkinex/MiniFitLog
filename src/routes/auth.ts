import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { authCredentialsSchema } from '../schemas/auth.js'
import type { AuthService } from '../services/auth.js'

const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 86400 * 30

function setAuthCookie(reply: FastifyReply, token: string) {
  reply.setCookie(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function authMiddleware(fastify: FastifyInstance, service: AuthService) {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.url === '/login' || request.url.startsWith('/api/auth') || request.url.startsWith('/assets/')) {
      return
    }

    const token = request.cookies?.[COOKIE_NAME]
    const user = token ? service.getUserByToken(token) : null

    if (!user) {
      if (request.url.startsWith('/api/')) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
      return reply.redirect('/login')
    }

    ;(request as any).user = user
  })

  fastify.get('/api/auth/status', async (request: FastifyRequest) => {
    const token = request.cookies?.[COOKIE_NAME]
    const user = token ? service.getUserByToken(token) : null
    return {
      hasUsers: service.hasUsers(),
      authenticated: Boolean(user),
      user,
    }
  })

  fastify.post('/api/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = authCredentialsSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: parsed.error.issues })
    }

    const result = service.register(parsed.data.email, parsed.data.password)
    if (!result.ok) {
      return reply.status(result.error.status).send({ error: result.error.message })
    }

    setAuthCookie(reply, result.value.token)
    return { ok: true, user: result.value.user }
  })

  fastify.post('/api/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = authCredentialsSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: parsed.error.issues })
    }

    const result = service.login(parsed.data.email, parsed.data.password)
    if (!result.ok) {
      return reply.status(result.error.status).send({ error: result.error.message })
    }

    setAuthCookie(reply, result.value.token)
    return { ok: true, user: result.value.user }
  })

  fastify.post('/api/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies?.[COOKIE_NAME]
    if (token) service.logout(token)
    reply.clearCookie(COOKIE_NAME, { path: '/' })
    return { ok: true }
  })
}
