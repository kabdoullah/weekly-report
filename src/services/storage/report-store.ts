import "server-only"

import { randomUUID } from "node:crypto"

import {
  reportInputSchema,
  reportSchema,
  type Report,
  type ReportInput,
  type ReportSummary,
} from "@/features/report/types/report.schema"

import { getDb } from "./db"

/**
 * SQLite-backed report store (one row per report, full JSON in `data`).
 * Server-only — the source of truth that PPTX/PDF generation reads from.
 * Swap this module for another backend (Postgres…) without touching callers.
 *
 * Every function requires the caller's `userId` and scopes to it — ownership
 * lives in the `user_id` column, not in the `data` JSON blob (that payload is
 * also the exact PPTX/PDF generation input and round-trips through the
 * client, so it doesn't need to carry auth concerns).
 */

function parseRow(row: { data: string }): Report {
  return reportSchema.parse(JSON.parse(row.data))
}

export async function listReports(userId: string): Promise<ReportSummary[]> {
  const rows = getDb()
    .prepare(
      "SELECT data FROM reports WHERE user_id = ? ORDER BY updated_at DESC"
    )
    .all(userId) as { data: string }[]

  return rows.map(parseRow).map(({ id, meta, updatedAt }) => ({
    id,
    meta,
    updatedAt,
  }))
}

export async function getReport(
  id: string,
  userId: string
): Promise<Report | null> {
  const row = getDb()
    .prepare("SELECT data FROM reports WHERE id = ? AND user_id = ?")
    .get(id, userId) as { data: string } | undefined

  return row ? parseRow(row) : null
}

function upsert(report: Report, userId: string): void {
  getDb()
    .prepare(
      `INSERT INTO reports (id, user_id, data, updated_at) VALUES (@id, @userId, @data, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET data = @data, updated_at = @updatedAt`
    )
    .run({
      id: report.id,
      userId,
      data: JSON.stringify(report),
      updatedAt: report.updatedAt,
    })
}

export async function createReport(
  input: ReportInput,
  userId: string
): Promise<Report> {
  const data = reportInputSchema.parse(input)
  const now = new Date().toISOString()
  const report: Report = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  upsert(report, userId)
  return report
}

export async function updateReport(
  id: string,
  input: ReportInput,
  userId: string
): Promise<Report> {
  const existing = await getReport(id, userId)
  if (!existing) {
    throw new Error(`Report not found: ${id}`)
  }
  const data = reportInputSchema.parse(input)
  const report: Report = {
    ...data,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }
  upsert(report, userId)
  return report
}

export async function deleteReport(id: string, userId: string): Promise<void> {
  getDb()
    .prepare("DELETE FROM reports WHERE id = ? AND user_id = ?")
    .run(id, userId)
}
