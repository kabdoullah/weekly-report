import "server-only"

import { randomUUID } from "node:crypto"

import {
  emailHistoryEntrySchema,
  type AttachmentChoice,
  type EmailHistoryEntry,
  type EmailStatus,
  type EmailTrigger,
} from "@/features/email/types/email-history.schema"

import { getDb } from "./db"

/**
 * One row per send/draft/schedule attempt. Server-only.
 * Real columns for what the History UI filters/sorts by (status, week, dates);
 * everything else lives in the `data` JSON blob.
 */

interface HistoryRow {
  id: string
  report_id: string
  week_id: string
  subject: string
  status: string
  trigger: string
  scheduled_for: string | null
  sent_at: string | null
  created_at: string
  data: string
}

interface StoredData {
  body: string
  to: string[]
  cc: string[]
  attachments: AttachmentChoice
  errorMessage: string | null
}

function parseRow(row: HistoryRow): EmailHistoryEntry {
  const data = JSON.parse(row.data) as StoredData
  return emailHistoryEntrySchema.parse({
    id: row.id,
    reportId: row.report_id,
    weekId: row.week_id,
    subject: row.subject,
    status: row.status,
    trigger: row.trigger,
    scheduledFor: row.scheduled_for,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    ...data,
  })
}

export async function listEmailHistory(filter?: {
  status?: EmailStatus
}): Promise<EmailHistoryEntry[]> {
  const rows = filter?.status
    ? (getDb()
        .prepare(
          "SELECT * FROM email_history WHERE status = ? ORDER BY created_at DESC"
        )
        .all(filter.status) as HistoryRow[])
    : (getDb()
        .prepare("SELECT * FROM email_history ORDER BY created_at DESC")
        .all() as HistoryRow[])

  return rows.map(parseRow)
}

export async function getEmailHistoryEntry(
  id: string
): Promise<EmailHistoryEntry | null> {
  const row = getDb()
    .prepare("SELECT * FROM email_history WHERE id = ?")
    .get(id) as HistoryRow | undefined
  return row ? parseRow(row) : null
}

export interface CreateEmailHistoryInput {
  reportId: string
  weekId: string
  subject: string
  status: EmailStatus
  trigger: EmailTrigger
  scheduledFor?: string | null
  sentAt?: string | null
  body: string
  to: string[]
  cc: string[]
  attachments: AttachmentChoice
  errorMessage?: string | null
}

export async function createEmailHistoryEntry(
  input: CreateEmailHistoryInput
): Promise<EmailHistoryEntry> {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const data: StoredData = {
    body: input.body,
    to: input.to,
    cc: input.cc,
    attachments: input.attachments,
    errorMessage: input.errorMessage ?? null,
  }

  getDb()
    .prepare(
      `INSERT INTO email_history
         (id, report_id, week_id, subject, status, trigger, scheduled_for, sent_at, created_at, data)
       VALUES
         (@id, @reportId, @weekId, @subject, @status, @trigger, @scheduledFor, @sentAt, @createdAt, @data)`
    )
    .run({
      id,
      reportId: input.reportId,
      weekId: input.weekId,
      subject: input.subject,
      status: input.status,
      trigger: input.trigger,
      scheduledFor: input.scheduledFor ?? null,
      sentAt: input.sentAt ?? null,
      createdAt,
      data: JSON.stringify(data),
    })

  const entry = await getEmailHistoryEntry(id)
  if (!entry) throw new Error("Failed to persist email history entry")
  return entry
}

export async function updateEmailHistoryStatus(
  id: string,
  status: EmailStatus,
  patch?: { sentAt?: string | null; errorMessage?: string | null }
): Promise<EmailHistoryEntry> {
  const existing = await getEmailHistoryEntry(id)
  if (!existing) throw new Error(`Email history entry not found: ${id}`)

  const data: StoredData = {
    body: existing.body,
    to: existing.to,
    cc: existing.cc,
    attachments: existing.attachments,
    errorMessage: patch?.errorMessage ?? existing.errorMessage,
  }

  getDb()
    .prepare(
      `UPDATE email_history
       SET status = @status, sent_at = @sentAt, data = @data
       WHERE id = @id`
    )
    .run({
      id,
      status,
      sentAt: patch?.sentAt !== undefined ? patch.sentAt : existing.sentAt,
      data: JSON.stringify(data),
    })

  const entry = await getEmailHistoryEntry(id)
  if (!entry) throw new Error("Failed to update email history entry")
  return entry
}

export async function hasSentForWeek(weekId: string): Promise<boolean> {
  const row = getDb()
    .prepare(
      "SELECT 1 FROM email_history WHERE week_id = ? AND status = 'sent' LIMIT 1"
    )
    .get(weekId)
  return row !== undefined
}
