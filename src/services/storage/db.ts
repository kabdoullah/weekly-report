import "server-only"

import { mkdirSync } from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

/**
 * Single shared SQLite connection. The DB file lives at `DATABASE_PATH`
 * (default `data/reports.db`) — mount that directory as a volume in production
 * so reports persist across restarts/deploys.
 */

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const file =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "reports.db")
  mkdirSync(path.dirname(file), { recursive: true })

  db = new Database(file)
  db.pragma("journal_mode = WAL")
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id         TEXT PRIMARY KEY,
      data       TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports (updated_at DESC);

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );
  `)

  // SQLite can't add a column conditionally in plain SQL — guard manually so
  // this stays idempotent across cold starts on a pre-existing reports.db.
  const hasUserId = (
    db.pragma("table_info(reports)") as { name: string }[]
  ).some((col) => col.name === "user_id")
  if (!hasUserId) {
    db.exec(`ALTER TABLE reports ADD COLUMN user_id TEXT REFERENCES users(id)`)
  }
  db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports (user_id)`)

  return db
}
