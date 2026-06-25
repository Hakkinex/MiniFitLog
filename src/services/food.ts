import type { AppDatabase } from '../db/connection.js'
import { createFoodItemsRepository, createMealRecordsRepository, createWeeklyBmrRepository } from '../repositories/food.js'
import { createSettingsRepository, createBmrCascadeRepository } from '../repositories/settings.js'
import { type FoodItemInput, type MealRecordItemInput, type WeeklyBmrInput } from '../schemas/food.js'
import { ok, err, type Result } from '../lib/result.js'

export type AppError = { status: number; message: string }

export type FoodService = ReturnType<typeof createFoodService>

export function createFoodService(db: AppDatabase) {
  const foodRepo = createFoodItemsRepository(db)
  const mealRepo = createMealRecordsRepository(db)
  const bmrRepo = createWeeklyBmrRepository(db)
  const settingsRepo = createSettingsRepository(db)
  const cascadeRepo = createBmrCascadeRepository(db)

  return {
    getAllFoods(userId: number) {
      return foodRepo.getAll(userId)
    },

    getFoodSources(userId: number) {
      return foodRepo.getSources(userId)
    },

    createFood(userId: number, input: FoodItemInput): Result<any, AppError> {
      try {
        return ok(foodRepo.create(userId, input))
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    updateFood(userId: number, id: number, input: FoodItemInput): Result<any, AppError> {
      try {
        const result = foodRepo.update(userId, id, input)
        if (!result) return err({ status: 404, message: 'Food item not found' })
        return ok(result)
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    deleteFood(userId: number, id: number): Result<any, AppError> {
      try {
        foodRepo.delete(userId, id)
        return ok({ deleted: true })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    searchFoods(userId: number, query: string) {
      return foodRepo.search(userId, query)
    },

    getFoodMonthData(userId: number, year: number, month: number): Result<any, AppError> {
      const mealRecords = mealRepo.getByMonth(userId, year, month)
      const bmrRecords = bmrRepo.getByMonth(userId, year, month)
      const foodItems = foodRepo.getAll(userId)

      const foodMap: Record<number, any> = {}
      ;(foodItems as any[]).forEach(f => { foodMap[f.id] = f })

      const dailyMap: Record<string, Record<string, any[]>> = {}
      ;(mealRecords as any[]).forEach(r => {
        if (!dailyMap[r.date]) dailyMap[r.date] = { breakfast: [], lunch: [], dinner: [] }
        const item: any = {
          id: r.id,
          food_item_id: r.food_item_id,
          custom_name: r.custom_name,
          custom_calories: r.custom_calories,
          sort_order: r.sort_order,
        }
        if (r.food_item_id && foodMap[r.food_item_id]) {
          item.food = foodMap[r.food_item_id]
        }
        dailyMap[r.date][r.meal_type].push(item)
      })

      const bmrMap: Record<string, any> = {}
      ;(bmrRecords as any[]).forEach(b => { bmrMap[b.date] = b })

      const daily: any[] = []
      for (const [date, meals] of Object.entries(dailyMap)) {
        const breakfastCal = meals.breakfast.reduce((sum: number, i: any) => sum + (i.food?.calories ?? i.custom_calories ?? 0), 0)
        const lunchCal = meals.lunch.reduce((sum: number, i: any) => sum + (i.food?.calories ?? i.custom_calories ?? 0), 0)
        const dinnerCal = meals.dinner.reduce((sum: number, i: any) => sum + (i.food?.calories ?? i.custom_calories ?? 0), 0)
        daily.push({
          date,
          meals,
          breakfastCal,
          lunchCal,
          dinnerCal,
          totalCal: breakfastCal + lunchCal + dinnerCal,
        })
      }

      return ok({
        year,
        month,
        daily,
        bmrRecords,
        foodItems,
      })
    },

    saveMeal(userId: number, date: string, mealType: string, items: MealRecordItemInput[]): Result<any, AppError> {
      try {
        for (const item of items) {
          if (item.food_item_id && !foodRepo.getById(userId, item.food_item_id)) {
            return err({ status: 400, message: 'Food item does not belong to current user' })
          }
        }
        mealRepo.replaceMeal(userId, date, mealType, items)
        return ok({ saved: true })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    saveBmr(userId: number, input: WeeklyBmrInput): Result<any, AppError> {
      try {
        bmrRepo.upsert(userId, input)
        return ok({ saved: true })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    cascadeBmr(userId: number, fromDate: string, bmr: number): Result<any, AppError> {
      try {
        cascadeRepo.cascadeForward(userId, fromDate, bmr)
        return ok({ cascaded: true })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    getSetting(userId: number, key: string) {
      return settingsRepo.get(userId, key)
    },

    setSetting(userId: number, key: string, value: string) {
      settingsRepo.set(userId, key, value)
      return { key, value }
    },

    getAllSettings(userId: number) {
      return settingsRepo.getAll(userId)
    },
  }
}
