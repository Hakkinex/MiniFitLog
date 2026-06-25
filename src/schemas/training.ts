import { z } from 'zod/v4'

export const EXERCISE_TYPES = [
  '超慢跑(30mins)',
  '爆裂飛輪',
  '踏步機(30mins)',
  'Tabata 15 mins',
  '爬樓梯(40mins)',
  '渣打半馬',
  '腳踏車',
  '其他',
] as const

export const PLANK_TYPES = [
  '棒式*5(30秒)',
  '捲腹(10次)',
  '深蹲(10次)',
  '提臀(10次)',
  '弓箭步(10次)',
  '上胸(10次)',
  'Workout*2',
  '其他',
] as const

export const weeklyMetricsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  body_fat: z.number().min(0).max(100).optional().nullable(),
  weight: z.number().min(0).max(500).optional().nullable(),
  waist: z.number().min(0).max(300).optional().nullable(),
})

export const dailyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercise_type: z.enum(EXERCISE_TYPES).optional().nullable(),
  exercise_custom: z.string().max(100).optional().nullable(),
  cardio_done: z.number().int().min(0).max(1),
  cardio_heartbeat: z.number().int().min(0).max(300).optional().nullable(),
  plank_done: z.number().int().min(0).max(1),
  plank_heartbeat: z.number().int().min(0).max(300).optional().nullable(),
  plank_type: z.enum(PLANK_TYPES).optional().nullable(),
  plank_custom: z.string().max(100).optional().nullable(),
  note: z.string().max(200).optional().nullable(),
})

export const yearMonthParamsSchema = z.object({
  year: z.string().regex(/^\d{4}$/).transform(Number),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/).transform(Number),
})

export const dateParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type WeeklyMetricsInput = z.infer<typeof weeklyMetricsSchema>
export type DailyRecordInput = z.infer<typeof dailyRecordSchema>
