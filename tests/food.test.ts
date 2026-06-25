import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../src/db/migrate.js'
import { createFoodItemsRepository, createMealRecordsRepository, createWeeklyBmrRepository } from '../src/repositories/food.js'
import { createSettingsRepository } from '../src/repositories/settings.js'

let db: Database.Database
const USER_ID = 1

beforeEach(() => {
  db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  db.prepare("INSERT INTO users (id, email, password_hash, password_salt) VALUES (?, ?, 'hash', 'salt')").run(USER_ID, 'user@example.com')
})

afterEach(() => {
  db.close()
})

describe('Food Items Repository', () => {
  const repo = () => createFoodItemsRepository(db)

  it('should create and retrieve food items', () => {
    repo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null })
    repo().create(USER_ID, { source: '便當', name: '番茄炒蛋+節瓜+鮭魚', calories: 265, protein: null, notes: null })
    const all = repo().getAll(USER_ID) as any[]
    expect(all.length).toBe(2)
    const sources = all.map((a: any) => a.source)
    expect(sources).toContain('自煮')
    expect(sources).toContain('便當')
    expect(all.find((a: any) => a.source === '便當').calories).toBe(265)
  })

  it('should get food by source', () => {
    repo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null })
    repo().create(USER_ID, { source: '便當', name: '雞胸肉便當', calories: 240, protein: null, notes: null })
    const items = repo().getBySource(USER_ID, '自煮') as any[]
    expect(items.length).toBe(1)
    expect(items[0].name).toBe('番茄炒蛋')
  })

  it('should get distinct sources', () => {
    repo().create(USER_ID, { source: '自煮', name: 'A', calories: 100, protein: null, notes: null })
    repo().create(USER_ID, { source: '便當', name: 'B', calories: 200, protein: null, notes: null })
    repo().create(USER_ID, { source: '自煮', name: 'C', calories: 300, protein: null, notes: null })
    const sources = repo().getSources(USER_ID) as { source: string }[]
    expect(sources.length).toBe(2)
  })

  it('should update food items', () => {
    const created = repo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null }) as any
    repo().update(USER_ID, created.id, { source: '自煮', name: '番茄炒蛋(兩顆蛋)', calories: 200, protein: 12, notes: '兩顆蛋' })
    const updated = repo().getById(USER_ID, created.id) as any
    expect(updated.calories).toBe(200)
    expect(updated.protein).toBe(12)
  })

  it('should delete food items', () => {
    const created = repo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null }) as any
    repo().delete(USER_ID, created.id)
    const all = repo().getAll(USER_ID) as any[]
    expect(all.length).toBe(0)
  })

  it('should search food items', () => {
    repo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null })
    repo().create(USER_ID, { source: '便當', name: '番茄炒蛋+鮭魚', calories: 265, protein: null, notes: null })
    repo().create(USER_ID, { source: '全聯', name: '大理石蛋糕', calories: 136, protein: null, notes: null })
    const results = repo().search(USER_ID, '番茄') as any[]
    expect(results.length).toBe(2)
  })

  it('should isolate food items by user', () => {
    db.prepare("INSERT INTO users (id, email, password_hash, password_salt) VALUES (?, ?, 'hash', 'salt')").run(2, 'other@example.com')
    repo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null })
    repo().create(2, { source: '自煮', name: '雞胸肉', calories: 240, protein: null, notes: null })

    expect((repo().getAll(USER_ID) as any[]).map(f => f.name)).toEqual(['番茄炒蛋'])
    expect((repo().getAll(2) as any[]).map(f => f.name)).toEqual(['雞胸肉'])
  })
})

describe('Meal Records Repository', () => {
  const repo = () => createMealRecordsRepository(db)
  const foodRepo = () => createFoodItemsRepository(db)

  it('should replace meal records', () => {
    const f1 = foodRepo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null }) as any
    repo().replaceMeal(USER_ID, '2026-04-05', 'breakfast', [
      { food_item_id: f1.id, custom_name: null, custom_calories: null, sort_order: 0 },
      { food_item_id: null, custom_name: '咖啡', custom_calories: 50, sort_order: 1 },
    ])
    const records = repo().getByDate(USER_ID, '2026-04-05') as any[]
    expect(records.length).toBe(2)
    expect(records[0].meal_type).toBe('breakfast')
    expect(records[1].custom_name).toBe('咖啡')
  })

  it('should replace meal clears old items first', () => {
    const f1 = foodRepo().create(USER_ID, { source: '自煮', name: 'A', calories: 100, protein: null, notes: null }) as any
    const f2 = foodRepo().create(USER_ID, { source: '自煮', name: 'B', calories: 200, protein: null, notes: null }) as any
    const f3 = foodRepo().create(USER_ID, { source: '自煮', name: 'C', calories: 300, protein: null, notes: null }) as any
    repo().replaceMeal(USER_ID, '2026-04-05', 'lunch', [
      { food_item_id: f1.id, custom_name: null, custom_calories: null, sort_order: 0 },
    ])
    repo().replaceMeal(USER_ID, '2026-04-05', 'lunch', [
      { food_item_id: f2.id, custom_name: null, custom_calories: null, sort_order: 0 },
      { food_item_id: f3.id, custom_name: null, custom_calories: null, sort_order: 1 },
    ])
    const records = repo().getByDate(USER_ID, '2026-04-05') as any[]
    expect(records.length).toBe(2)
  })

  it('should get meal records by month', () => {
    const f1 = foodRepo().create(USER_ID, { source: '自煮', name: '番茄炒蛋', calories: 170, protein: null, notes: null }) as any
    repo().replaceMeal(USER_ID, '2026-04-05', 'breakfast', [{ food_item_id: f1.id, custom_name: null, custom_calories: null, sort_order: 0 }])
    repo().replaceMeal(USER_ID, '2026-04-06', 'lunch', [{ food_item_id: null, custom_name: '便當', custom_calories: 450, sort_order: 0 }])
    repo().replaceMeal(USER_ID, '2026-05-01', 'dinner', [{ food_item_id: f1.id, custom_name: null, custom_calories: null, sort_order: 0 }])
    const apr = repo().getByMonth(USER_ID, 2026, 4) as any[]
    expect(apr.length).toBe(2)
  })
})

describe('Weekly BMR Repository', () => {
  const repo = () => createWeeklyBmrRepository(db)

  it('should upsert BMR records', () => {
    repo().upsert(USER_ID, { date: '2026-04-11', bmr: 10283 })
    const rec = repo().getByDate(USER_ID, '2026-04-11') as any
    expect(rec.bmr).toBe(10283)
  })

  it('should update BMR on conflict', () => {
    repo().upsert(USER_ID, { date: '2026-04-11', bmr: 10283 })
    repo().upsert(USER_ID, { date: '2026-04-11', bmr: 10500 })
    const rec = repo().getByDate(USER_ID, '2026-04-11') as any
    expect(rec.bmr).toBe(10500)
  })

  it('should get BMR by month', () => {
    repo().upsert(USER_ID, { date: '2026-04-11', bmr: 10283 })
    repo().upsert(USER_ID, { date: '2026-04-18', bmr: 10283 })
    const apr = repo().getByMonth(USER_ID, 2026, 4) as any[]
    expect(apr.length).toBe(2)
  })
})

describe('Settings Repository', () => {
  const repo = () => createSettingsRepository(db)

  it('should isolate settings by user', () => {
    db.prepare("INSERT INTO users (id, email, password_hash, password_salt) VALUES (?, ?, 'hash', 'salt')").run(2, 'other@example.com')
    repo().set(USER_ID, 'bmr_default', '10283')
    repo().set(2, 'bmr_default', '9000')

    expect(repo().get(USER_ID, 'bmr_default')).toBe('10283')
    expect(repo().get(2, 'bmr_default')).toBe('9000')
  })
})
