import { z } from 'zod/v4'

const settingsKeySchema = z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/)

export const bmrCascadeSchema = z.object({
  bmr: z.number().min(0).max(50000),
})

export const settingsUpdateSchema = z.object({
  key: settingsKeySchema,
  value: z.string().max(500),
})
