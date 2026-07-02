import { NextResponse } from "next/server"

import { scheduleEmailSchema } from "@/features/email/types/compose.schema"
import { jsonError, parseBody } from "@/lib/api"
import { formatWeekId } from "@/lib/week"
import { createEmailHistoryEntry } from "@/services/storage/email-history-store"
import { getReport } from "@/services/storage"

export async function POST(request: Request) {
  const parsed = await parseBody(request, scheduleEmailSchema)
  if ("response" in parsed) return parsed.response
  const input = parsed.data

  const report = await getReport(input.reportId)
  if (!report) return jsonError("Report not found", 404)

  const weekId = formatWeekId(report.meta.year, report.meta.weekNumber)
  const entry = await createEmailHistoryEntry({
    reportId: input.reportId,
    weekId,
    subject: input.subject,
    status: "scheduled",
    trigger: "scheduled",
    scheduledFor: input.scheduledFor,
    body: input.body,
    to: input.to,
    cc: input.cc,
    attachments: input.attachments,
  })
  return NextResponse.json(entry)
}
