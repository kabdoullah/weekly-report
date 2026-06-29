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
 */

function parseRow(row: { data: string }): Report {
  return reportSchema.parse(JSON.parse(row.data))
}

export async function listReports(): Promise<ReportSummary[]> {
  const rows = getDb()
    .prepare("SELECT data FROM reports ORDER BY updated_at DESC")
    .all() as { data: string }[]

  return rows.map(parseRow).map(({ id, meta, updatedAt }) => ({
    id,
    meta,
    updatedAt,
  }))
}

export async function getReport(id: string): Promise<Report | null> {
  const row = getDb()
    .prepare("SELECT data FROM reports WHERE id = ?")
    .get(id) as { data: string } | undefined

  return row ? parseRow(row) : null
}

function upsert(report: Report): void {
  getDb()
    .prepare(
      `INSERT INTO reports (id, data, updated_at) VALUES (@id, @data, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET data = @data, updated_at = @updatedAt`
    )
    .run({
      id: report.id,
      data: JSON.stringify(report),
      updatedAt: report.updatedAt,
    })
}

export async function createReport(input: ReportInput): Promise<Report> {
  const data = reportInputSchema.parse(input)
  const now = new Date().toISOString()
  const report: Report = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  upsert(report)
  return report
}

export async function updateReport(
  id: string,
  input: ReportInput
): Promise<Report> {
  const existing = await getReport(id)
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
  upsert(report)
  return report
}

export async function deleteReport(id: string): Promise<void> {
  getDb().prepare("DELETE FROM reports WHERE id = ?").run(id)
}
