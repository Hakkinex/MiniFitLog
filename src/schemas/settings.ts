import { z } from 'zod/v4'

export const bmrCascadeSchema = z.object({
  bmr: z.number().min(0).max(50000),
})

export const settingsUpdateSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(500),
})
