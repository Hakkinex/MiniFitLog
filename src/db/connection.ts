import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

const DB_DIR = path.resolve(import.meta.dirname, '../../data')
const DB_PATH = path.join(DB_DIR, 'training.db')

export function getDbPath(): string {
  return process.env.DB_PATH || DB_PATH
}

export function createDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath || getDbPath()
  const dir = path.dirname(resolvedPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const db = new Database(resolvedPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

export type AppDatabase = Database.Database
