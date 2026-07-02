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

    -- Single row (id = 'default'): encrypted Microsoft Graph OAuth tokens.
    CREATE TABLE IF NOT EXISTS microsoft_tokens (
      id            TEXT PRIMARY KEY,
      account_email TEXT,
      iv            TEXT NOT NULL,
      auth_tag      TEXT NOT NULL,
      ciphertext    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    -- Single row (id = 'default'): recipients/template/auto-send settings.
    CREATE TABLE IF NOT EXISTS email_settings (
      id            TEXT PRIMARY KEY,
      outlook_email TEXT,
      data          TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    -- One row per send/draft/schedule attempt.
    CREATE TABLE IF NOT EXISTS email_history (
      id             TEXT PRIMARY KEY,
      report_id      TEXT NOT NULL,
      week_id        TEXT NOT NULL,
      subject        TEXT NOT NULL,
      status         TEXT NOT NULL,
      trigger        TEXT NOT NULL,
      scheduled_for  TEXT,
      sent_at        TEXT,
      created_at     TEXT NOT NULL,
      data           TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_email_history_week_id ON email_history (week_id);
    CREATE INDEX IF NOT EXISTS idx_email_history_created_at ON email_history (created_at DESC);

    -- In-app notifications (bell icon), populated starting Phase 2.
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL,
      read       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      data       TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_read_created_at ON notifications (read, created_at DESC);
  `)
  return db
}
