import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { foodItemSchema, mealSaveSchema, weeklyBmrSchema, dateMealParamsSchema, foodIdParamsSchema, foodSearchQuerySchema, settingKeyParamsSchema } from '../schemas/food.js'
import { bmrCascadeSchema, settingsUpdateSchema } from '../schemas/settings.js'
import { dateParamsSchema, yearMonthParamsSchema } from '../schemas/training.js'
import type { FoodService } from '../services/food.js'

function getUserId(request: FastifyRequest): number {
  return (request as any).user.id
}

export async function foodRoutes(fastify: FastifyInstance, service: FoodService) {
  fastify.get('/api/foods', async (request: FastifyRequest, reply: FastifyReply) => {
    return service.getAllFoods(getUserId(request))
  })

  fastify.get('/api/foods/sources', async (request: FastifyRequest, reply: FastifyReply) => {
    return service.getFoodSources(getUserId(request))
  })

  fastify.get('/api/foods/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = foodSearchQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid query', details: parsed.error.issues })
    }
    return service.searchFoods(getUserId(request), parsed.data.q)
  })

  fastify.post('/api/foods', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = foodItemSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: parsed.error.issues })
    }
    const result = service.createFood(getUserId(request), parsed.data)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.put('/api/foods/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = foodIdParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid id', details: paramParsed.error.issues })
    }
    const bodyParsed = foodItemSchema.safeParse(request.body)
    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: bodyParsed.error.issues })
    }
    const result = service.updateFood(getUserId(request), paramParsed.data.id, bodyParsed.data)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.delete('/api/foods/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = foodIdParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid id', details: paramParsed.error.issues })
    }
    const result = service.deleteFood(getUserId(request), paramParsed.data.id)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.get('/api/food/months/:year/:month', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = yearMonthParamsSchema.safeParse(request.params)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid year/month', details: parsed.error.issues })
    }
    const { year, month } = parsed.data
    const result = service.getFoodMonthData(getUserId(request), year, month)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.put('/api/food/daily/:date/:meal', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = dateMealParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid date/meal', details: paramParsed.error.issues })
    }
    const bodyParsed = mealSaveSchema.safeParse(request.body)
    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: bodyParsed.error.issues })
    }
    const { date, meal } = paramParsed.data
    const result = service.saveMeal(getUserId(request), date, meal, bodyParsed.data.items)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.put('/api/food/bmr/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = dateParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid date', details: paramParsed.error.issues })
    }
    const bodyParsed = weeklyBmrSchema.safeParse({ ...(request.body as object), date: paramParsed.data.date })
    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: bodyParsed.error.issues })
    }
    const result = service.saveBmr(getUserId(request), bodyParsed.data)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.put('/api/food/bmr-cascade/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const paramParsed = dateParamsSchema.safeParse(request.params)
    if (!paramParsed.success) {
      return reply.status(400).send({ error: 'Invalid date', details: paramParsed.error.issues })
    }
    const bodyParsed = bmrCascadeSchema.safeParse(request.body)
    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: bodyParsed.error.issues })
    }
    const result = service.cascadeBmr(getUserId(request), paramParsed.data.date, bodyParsed.data.bmr)
    if (result.ok) return result.value
    return reply.status(result.error.status).send({ error: result.error.message })
  })

  fastify.get('/api/settings', async (request: FastifyRequest) => {
    return service.getAllSettings(getUserId(request))
  })

  fastify.get('/api/settings/:key', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = settingKeyParamsSchema.safeParse(request.params)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid key', details: parsed.error.issues })
    }
    const value = service.getSetting(getUserId(request), parsed.data.key)
    return { key: parsed.data.key, value }
  })

  fastify.put('/api/settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = settingsUpdateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body', details: parsed.error.issues })
    }
    return service.setSetting(getUserId(request), parsed.data.key, parsed.data.value)
  })
}
