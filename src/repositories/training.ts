import type { AppDatabase } from '../db/connection.js'
import { type WeeklyMetricsInput, type DailyRecordInput } from '../schemas/training.js'

export function createWeeklyMetricsRepository(db: AppDatabase) {
  return {
    upsert(userId: number, input: WeeklyMetricsInput) {
      return db
        .prepare(
          `INSERT INTO weekly_metrics (user_id, date, body_fat, weight, waist)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(user_id, date) DO UPDATE SET
             body_fat = excluded.body_fat,
             weight = excluded.weight,
             waist = excluded.waist,
             updated_at = datetime('now')`
        )
        .run(userId, input.date, input.body_fat ?? null, input.weight ?? null, input.waist ?? null)
    },

    getByMonth(userId: number, year: number, month: number) {
      const pad = (n: number) => String(n).padStart(2, '0')
      const prefix = `${year}-${pad(month)}`
      return db
        .prepare('SELECT * FROM weekly_metrics WHERE user_id = ? AND date LIKE ? ORDER BY date')
        .all(userId, `${prefix}%`)
    },

    getByDate(userId: number, date: string) {
      return db.prepare('SELECT * FROM weekly_metrics WHERE user_id = ? AND date = ?').get(userId, date)
    },
  }
}

export function createDailyRecordsRepository(db: AppDatabase) {
  return {
    upsert(userId: number, input: DailyRecordInput) {
      return db
        .prepare(
          `INSERT INTO daily_records (user_id, date, exercise_type, exercise_custom, cardio_done, cardio_heartbeat, plank_done, plank_heartbeat, plank_type, plank_custom, note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id, date) DO UPDATE SET
             exercise_type = excluded.exercise_type,
             exercise_custom = excluded.exercise_custom,
             cardio_done = excluded.cardio_done,
             cardio_heartbeat = excluded.cardio_heartbeat,
             plank_done = excluded.plank_done,
             plank_heartbeat = excluded.plank_heartbeat,
             plank_type = excluded.plank_type,
             plank_custom = excluded.plank_custom,
             note = excluded.note,
             updated_at = datetime('now')`
        )
        .run(
          userId,
          input.date,
          input.exercise_type ?? null,
          input.exercise_custom ?? null,
          input.cardio_done,
          input.cardio_heartbeat ?? null,
          input.plank_done,
          input.plank_heartbeat ?? null,
          input.plank_type ?? null,
          input.plank_custom ?? null,
          input.note ?? null
        )
    },

    getByMonth(userId: number, year: number, month: number) {
      const pad = (n: number) => String(n).padStart(2, '0')
      const prefix = `${year}-${pad(month)}`
      return db
        .prepare('SELECT * FROM daily_records WHERE user_id = ? AND date LIKE ? ORDER BY date')
        .all(userId, `${prefix}%`)
    },

    getByDate(userId: number, date: string) {
      return db.prepare('SELECT * FROM daily_records WHERE user_id = ? AND date = ?').get(userId, date)
    },

    bulkInsert(userId: number, records: DailyRecordInput[]) {
      const stmt = db.prepare(
        `INSERT INTO daily_records (user_id, date, exercise_type, exercise_custom, cardio_done, cardio_heartbeat, plank_done, plank_heartbeat, plank_type, plank_custom, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET
           exercise_type = excluded.exercise_type,
           exercise_custom = excluded.exercise_custom,
           cardio_done = excluded.cardio_done,
           cardio_heartbeat = excluded.cardio_heartbeat,
           plank_done = excluded.plank_done,
           plank_heartbeat = excluded.plank_heartbeat,
           plank_type = excluded.plank_type,
           plank_custom = excluded.plank_custom,
           note = excluded.note,
           updated_at = datetime('now')`
      )
      const tx = db.transaction((recs: DailyRecordInput[]) => {
        for (const r of recs) {
          stmt.run(
            userId,
            r.date,
            r.exercise_type ?? null,
            r.exercise_custom ?? null,
            r.cardio_done,
            r.cardio_heartbeat ?? null,
            r.plank_done,
            r.plank_heartbeat ?? null,
            r.plank_type ?? null,
            r.plank_custom ?? null,
            r.note ?? null
          )
        }
      })
      tx(records)
    },
  }
}

export function createWeeklyMetricsBulkRepository(db: AppDatabase) {
  return {
    bulkInsert(userId: number, metrics: WeeklyMetricsInput[]) {
      const stmt = db.prepare(
        `INSERT INTO weekly_metrics (user_id, date, body_fat, weight, waist)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, date) DO UPDATE SET
           body_fat = excluded.body_fat,
           weight = excluded.weight,
           waist = excluded.waist,
           updated_at = datetime('now')`
      )
      const tx = db.transaction((items: WeeklyMetricsInput[]) => {
        for (const m of items) {
          stmt.run(userId, m.date, m.body_fat ?? null, m.weight ?? null, m.waist ?? null)
        }
      })
      tx(metrics)
    },
  }
}
