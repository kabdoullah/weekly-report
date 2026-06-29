import "server-only"

import { randomUUID } from "node:crypto"
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  reportInputSchema,
  reportSchema,
  type Report,
  type ReportInput,
  type ReportSummary,
} from "@/features/report/types/report.schema"

/**
 * Filesystem JSON store: one `<id>.json` per report under `data/reports/`.
 * Server-only — the source of truth that PPTX/PDF generation reads from.
 * Swap this module for a DB later without touching callers (same signatures).
 */

const DATA_DIR = path.join(process.cwd(), "data", "reports")

async function ensureDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
}

function fileFor(id: string): string {
  // Guard against path traversal from a crafted id.
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error(`Invalid report id: ${id}`)
  }
  return path.join(DATA_DIR, `${id}.json`)
}

async function readReportFile(file: string): Promise<Report> {
  const raw = await readFile(file, "utf8")
  return reportSchema.parse(JSON.parse(raw))
}

export async function listReports(): Promise<ReportSummary[]> {
  await ensureDir()
  const entries = await readdir(DATA_DIR)
  const reports = await Promise.all(
    entries
      .filter((name) => name.endsWith(".json"))
      .map((name) => readReportFile(path.join(DATA_DIR, name)))
  )

  return reports
    .map(({ id, meta, updatedAt }) => ({ id, meta, updatedAt }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getReport(id: string): Promise<Report | null> {
  try {
    return await readReportFile(fileFor(id))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

export async function createReport(input: ReportInput): Promise<Report> {
  await ensureDir()
  const data = reportInputSchema.parse(input)
  const now = new Date().toISOString()
  const report: Report = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await writeFile(fileFor(report.id), JSON.stringify(report, null, 2), "utf8")
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
  await writeFile(fileFor(report.id), JSON.stringify(report, null, 2), "utf8")
  return report
}

export async function deleteReport(id: string): Promise<void> {
  await rm(fileFor(id), { force: true })
}
