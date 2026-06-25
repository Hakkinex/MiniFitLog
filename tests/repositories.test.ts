import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../src/db/migrate.js'
import { createWeeklyMetricsRepository, createDailyRecordsRepository, createWeeklyMetricsBulkRepository } from '../src/repositories/training.js'

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

describe('Database Schema', () => {
  it('should create weekly_metrics table', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='weekly_metrics'").all()
    expect(tables.length).toBe(1)
  })

  it('should create daily_records table', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_records'").all()
    expect(tables.length).toBe(1)
  })

  it('should create _migrations table', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_migrations'").all()
    expect(tables.length).toBe(1)
  })

  it('should track applied migrations', () => {
    const applied = db.prepare('SELECT name FROM _migrations').all() as { name: string }[]
    expect(applied.length).toBe(5)
    expect(applied[0].name).toBe('001_initial')
    expect(applied[1].name).toBe('002_food_tracking')
    expect(applied[2].name).toBe('003_settings')
    expect(applied[3].name).toBe('004_user_auth')
    expect(applied[4].name).toBe('005_user_data_isolation')
  })
})

describe('WeeklyMetrics Repository', () => {
  const repo = () => createWeeklyMetricsRepository(db)

  it('should upsert and retrieve weekly metrics', () => {
    repo().upsert(USER_ID, { date: '2026-01-05', body_fat: 28.9, weight: 59.3, waist: null })
    const result = repo().getByDate(USER_ID, '2026-01-05') as any
    expect(result.body_fat).toBe(28.9)
    expect(result.weight).toBe(59.3)
  })

  it('should update existing metrics on conflict', () => {
    repo().upsert(USER_ID, { date: '2026-01-05', body_fat: 28.9, weight: 59.3, waist: null })
    repo().upsert(USER_ID, { date: '2026-01-05', body_fat: 27.8, weight: 58.1, waist: 70 })
    const result = repo().getByDate(USER_ID, '2026-01-05') as any
    expect(result.body_fat).toBe(27.8)
    expect(result.weight).toBe(58.1)
    expect(result.waist).toBe(70)
  })

  it('should get metrics by month', () => {
    repo().upsert(USER_ID, { date: '2026-01-05', body_fat: 28.9, weight: 59.3, waist: null })
    repo().upsert(USER_ID, { date: '2026-01-12', body_fat: 27.8, weight: 58.1, waist: null })
    repo().upsert(USER_ID, { date: '2026-02-02', body_fat: 29.0, weight: 60.0, waist: null })
    const jan = repo().getByMonth(USER_ID, 2026, 1) as any[]
    expect(jan.length).toBe(2)
  })

  it('should isolate metrics by user', () => {
    db.prepare("INSERT INTO users (id, email, password_hash, password_salt) VALUES (?, ?, 'hash', 'salt')").run(2, 'other@example.com')
    repo().upsert(USER_ID, { date: '2026-01-05', body_fat: 28.9, weight: 59.3, waist: null })
    repo().upsert(2, { date: '2026-01-05', body_fat: 18.1, weight: 80.2, waist: null })

    const firstUser = repo().getByDate(USER_ID, '2026-01-05') as any
    const secondUser = repo().getByDate(2, '2026-01-05') as any

    expect(firstUser.weight).toBe(59.3)
    expect(secondUser.weight).toBe(80.2)
  })
})

describe('DailyRecords Repository', () => {
  const repo = () => createDailyRecordsRepository(db)

  it('should upsert and retrieve daily records', () => {
    repo().upsert(USER_ID, {
      date: '2026-01-05',
      exercise_type: '超慢跑(30mins)',
      exercise_custom: null,
      cardio_done: 1,
      cardio_heartbeat: 149,
      plank_done: 1,
      plank_heartbeat: 113,
      plank_type: '棒式*5(30秒)',
      plank_custom: null,
      note: null,
    })
    const result = repo().getByDate(USER_ID, '2026-01-05') as any
    expect(result.cardio_done).toBe(1)
    expect(result.cardio_heartbeat).toBe(149)
    expect(result.plank_type).toBe('棒式*5(30秒)')
  })

  it('should update existing records on conflict', () => {
    repo().upsert(USER_ID, { date: '2026-01-05', exercise_type: null, exercise_custom: null, cardio_done: 0, cardio_heartbeat: null, plank_done: 0, plank_heartbeat: null, plank_type: null, plank_custom: null, note: null })
    repo().upsert(USER_ID, { date: '2026-01-05', exercise_type: '爆裂飛輪', exercise_custom: null, cardio_done: 1, cardio_heartbeat: 152, plank_done: 1, plank_heartbeat: 120, plank_type: '捲腹(10次)', plank_custom: null, note: '加班' })
    const result = repo().getByDate(USER_ID, '2026-01-05') as any
    expect(result.cardio_done).toBe(1)
    expect(result.note).toBe('加班')
  })

  it('should get records by month', () => {
    repo().upsert(USER_ID, { date: '2026-01-05', exercise_type: null, exercise_custom: null, cardio_done: 1, cardio_heartbeat: null, plank_done: 0, plank_heartbeat: null, plank_type: null, plank_custom: null, note: null })
    repo().upsert(USER_ID, { date: '2026-01-06', exercise_type: null, exercise_custom: null, cardio_done: 0, cardio_heartbeat: null, plank_done: 1, plank_heartbeat: null, plank_type: null, plank_custom: null, note: null })
    const jan = repo().getByMonth(USER_ID, 2026, 1) as any[]
    expect(jan.length).toBe(2)
  })

  it('should bulk insert records', () => {
    const records = [
      { date: '2026-01-05', exercise_type: null, exercise_custom: null, cardio_done: 1, cardio_heartbeat: 149, plank_done: 1, plank_heartbeat: 113, plank_type: null, plank_custom: null, note: null },
      { date: '2026-01-06', exercise_type: null, exercise_custom: null, cardio_done: 0, cardio_heartbeat: null, plank_done: 0, plank_heartbeat: null, plank_type: null, plank_custom: null, note: '加班' },
    ]
    repo().bulkInsert(USER_ID, records)
    const jan = repo().getByMonth(USER_ID, 2026, 1) as any[]
    expect(jan.length).toBe(2)
  })
})

describe('WeeklyMetrics Bulk Repository', () => {
  it('should bulk insert metrics', () => {
    const bulk = createWeeklyMetricsBulkRepository(db)
    bulk.bulkInsert(USER_ID, [
      { date: '2026-01-05', body_fat: 28.9, weight: 59.3, waist: null },
      { date: '2026-01-12', body_fat: 27.8, weight: 58.1, waist: 70 },
    ])
    const repo = createWeeklyMetricsRepository(db)
    const jan = repo.getByMonth(USER_ID, 2026, 1) as any[]
    expect(jan.length).toBe(2)
  })
})
