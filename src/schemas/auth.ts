import { z } from 'zod/v4'

export const authCredentialsSchema = z.object({
  email: z.string().email().max(254).transform(value => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
})

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>
