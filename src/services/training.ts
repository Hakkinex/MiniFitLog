import type { AppDatabase } from '../db/connection.js'
import { createDailyRecordsRepository, createWeeklyMetricsRepository, createWeeklyMetricsBulkRepository } from '../repositories/training.js'
import { type DailyRecordInput, type WeeklyMetricsInput } from '../schemas/training.js'
import { ok, err, type Result } from '../lib/result.js'

export type AppError = { status: number; message: string }

export type TrainingService = ReturnType<typeof createTrainingService>

export function createTrainingService(db: AppDatabase) {
  const weeklyRepo = createWeeklyMetricsRepository(db)
  const dailyRepo = createDailyRecordsRepository(db)
  const weeklyBulkRepo = createWeeklyMetricsBulkRepository(db)

  return {
    getMonthData(userId: number, year: number, month: number): Result<any, AppError> {
      const weeklyMetrics = weeklyRepo.getByMonth(userId, year, month)
      const dailyRecords = dailyRepo.getByMonth(userId, year, month)

      const cardioTotal = (dailyRecords as any[]).length
      const cardioDone = (dailyRecords as any[]).filter(r => r.cardio_done === 1).length
      const plankTotal = (dailyRecords as any[]).length
      const plankDone = (dailyRecords as any[]).filter(r => r.plank_done === 1).length

      return ok({
        year,
        month,
        weeklyMetrics,
        dailyRecords,
        stats: {
          cardioRate: cardioTotal > 0 ? cardioDone / cardioTotal : 0,
          plankRate: plankTotal > 0 ? plankDone / plankTotal : 0,
          cardioDone,
          cardioTotal,
          plankDone,
          plankTotal,
        },
      })
    },

    upsertDaily(userId: number, input: DailyRecordInput): Result<any, AppError> {
      try {
        dailyRepo.upsert(userId, input)
        return ok({ saved: true })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    upsertWeekly(userId: number, input: WeeklyMetricsInput): Result<any, AppError> {
      try {
        weeklyRepo.upsert(userId, input)
        return ok({ saved: true })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },

    importData(userId: number, metrics: WeeklyMetricsInput[], records: DailyRecordInput[]): Result<any, AppError> {
      try {
        weeklyBulkRepo.bulkInsert(userId, metrics)
        dailyRepo.bulkInsert(userId, records)
        return ok({ imported: { metrics: metrics.length, records: records.length } })
      } catch (e: any) {
        return err({ status: 500, message: e.message })
      }
    },
  }
}
