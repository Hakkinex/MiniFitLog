import { z } from 'zod/v4'

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const

export const foodItemSchema = z.object({
  id: z.number().int().optional(),
  source: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const mealRecordItemSchema = z.object({
  food_item_id: z.number().int().optional().nullable(),
  custom_name: z.string().max(200).optional().nullable(),
  custom_calories: z.number().min(0).max(10000).optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
})

export const mealSaveSchema = z.object({
  items: z.array(mealRecordItemSchema).min(0),
})

export const weeklyBmrSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bmr: z.number().min(0).max(50000),
})

export const dateMealParamsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: z.enum(MEAL_TYPES),
})

export const foodIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
})

export const foodSearchQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
})

export const settingKeyParamsSchema = z.object({
  key: z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_-]+$/),
})

export type FoodItemInput = z.infer<typeof foodItemSchema>
export type MealRecordItemInput = z.infer<typeof mealRecordItemSchema>
export type MealSaveInput = z.infer<typeof mealSaveSchema>
export type WeeklyBmrInput = z.infer<typeof weeklyBmrSchema>
