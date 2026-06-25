import type { AppDatabase } from '../db/connection.js'
import { type FoodItemInput, type MealRecordItemInput, type WeeklyBmrInput } from '../schemas/food.js'

export function createFoodItemsRepository(db: AppDatabase) {
  return {
    getAll(userId: number) {
      return db.prepare('SELECT * FROM food_items WHERE user_id = ? ORDER BY source, name').all(userId)
    },

    getById(userId: number, id: number) {
      return db.prepare('SELECT * FROM food_items WHERE user_id = ? AND id = ?').get(userId, id)
    },

    getBySource(userId: number, source: string) {
      return db.prepare('SELECT * FROM food_items WHERE user_id = ? AND source = ? ORDER BY name').all(userId, source)
    },

    getSources(userId: number) {
      return db.prepare('SELECT DISTINCT source FROM food_items WHERE user_id = ? ORDER BY source').all(userId) as { source: string }[]
    },

    create(userId: number, input: FoodItemInput) {
      const result = db
        .prepare(
          `INSERT INTO food_items (user_id, source, name, calories, protein, notes)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(userId, input.source, input.name, input.calories, input.protein ?? null, input.notes ?? null)
      return db.prepare('SELECT * FROM food_items WHERE user_id = ? AND id = ?').get(userId, result.lastInsertRowid)
    },

    update(userId: number, id: number, input: FoodItemInput) {
      db.prepare(
        `UPDATE food_items SET source = ?, name = ?, calories = ?, protein = ?, notes = ?, updated_at = datetime('now')
         WHERE user_id = ? AND id = ?`
      ).run(input.source, input.name, input.calories, input.protein ?? null, input.notes ?? null, userId, id)
      return db.prepare('SELECT * FROM food_items WHERE user_id = ? AND id = ?').get(userId, id)
    },

    delete(userId: number, id: number) {
      return db.prepare('DELETE FROM food_items WHERE user_id = ? AND id = ?').run(userId, id)
    },

    search(userId: number, query: string) {
      return db
        .prepare('SELECT * FROM food_items WHERE user_id = ? AND (name LIKE ? OR source LIKE ?) ORDER BY source, name')
        .all(userId, `%${query}%`, `%${query}%`)
    },
  }
}

export function createMealRecordsRepository(db: AppDatabase) {
  return {
    getByDate(userId: number, date: string) {
      return db
        .prepare('SELECT * FROM meal_records WHERE user_id = ? AND date = ? ORDER BY meal_type, sort_order')
        .all(userId, date)
    },

    getByMonth(userId: number, year: number, month: number) {
      const pad = (n: number) => String(n).padStart(2, '0')
      const prefix = `${year}-${pad(month)}`
      return db
        .prepare('SELECT * FROM meal_records WHERE user_id = ? AND date LIKE ? ORDER BY date, meal_type, sort_order')
        .all(userId, `${prefix}%`)
    },

    replaceMeal(userId: number, date: string, mealType: string, items: MealRecordItemInput[]) {
      const del = db.prepare('DELETE FROM meal_records WHERE user_id = ? AND date = ? AND meal_type = ?')
      const ins = db.prepare(
        `INSERT INTO meal_records (user_id, date, meal_type, food_item_id, custom_name, custom_calories, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      const tx = db.transaction((uid: number, d: string, mt: string, recs: MealRecordItemInput[]) => {
        del.run(uid, d, mt)
        for (let i = 0; i < recs.length; i++) {
          const r = recs[i]
          ins.run(uid, d, mt, r.food_item_id ?? null, r.custom_name ?? null, r.custom_calories ?? null, r.sort_order ?? i)
        }
      })
      tx(userId, date, mealType, items)
    },
  }
}

export function createWeeklyBmrRepository(db: AppDatabase) {
  return {
    upsert(userId: number, input: WeeklyBmrInput) {
      return db
        .prepare(
          `INSERT INTO weekly_bmr (user_id, date, bmr, deficit)
           VALUES (?, ?, ?, 0)
           ON CONFLICT(user_id, date) DO UPDATE SET
             bmr = excluded.bmr,
             updated_at = datetime('now')`
        )
        .run(userId, input.date, input.bmr)
    },

    getByMonth(userId: number, year: number, month: number) {
      const pad = (n: number) => String(n).padStart(2, '0')
      const prefix = `${year}-${pad(month)}`
      return db
        .prepare('SELECT * FROM weekly_bmr WHERE user_id = ? AND date LIKE ? ORDER BY date')
        .all(userId, `${prefix}%`)
    },

    getByDate(userId: number, date: string) {
      return db.prepare('SELECT * FROM weekly_bmr WHERE user_id = ? AND date = ?').get(userId, date)
    },
  }
}
