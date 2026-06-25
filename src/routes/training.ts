import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { weeklyMetricsSchema, dailyRecordSchema, yearMonthParamsSchema, dateParamsSchema, trainingImportSchema } from '../schemas/training.js'
import type { TrainingService } from '../services/training.js'

function getUserId(request: FastifyRequest): number {
  return (request as any).user.id
}

export async function trainingRoutes(fastify: FastifyInstance, service: TrainingService) {
  fastify.get('/api/months/:year/:month', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = yearMonthParamsSchema.safeParse(request.params)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid year/month', details: parsed.error.issues })
    }
    const { year, month } = parsed.data
    const result = service.getMonthData(getUserId(request), year, month)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.put('/api/daily/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = dateParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid date', details: paramParsed.error.issues })
    }
    const bodyParsed = dailyRecordSchema.safeParse(request.body)
    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: bodyParsed.error.issues })
    }
    const result = service.upsertDaily(getUserId(request), { ...bodyParsed.data, date: paramParsed.data.date })
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.put('/api/weekly/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = dateParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid date', details: paramParsed.error.issues })
    }
    const bodyParsed = weeklyMetricsSchema.safeParse(request.body)
    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: bodyParsed.error.issues })
    }
    const result = service.upsertWeekly(getUserId(request), { ...bodyParsed.data, date: paramParsed.data.date })
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.post('/api/import', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = trainingImportSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: parsed.error.issues })
    }
    const result = service.importData(getUserId(request), parsed.data.metrics, parsed.data.records)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })
}
