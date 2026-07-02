import { NextResponse } from "next/server"

import { composeEmailSchema } from "@/features/email/types/compose.schema"
import { jsonError, parseBody } from "@/lib/api"
import { formatWeekId } from "@/lib/week"
import { getMailProvider } from "@/services/mail"
import { buildMailAttachments } from "@/services/mail/attachments"
import { getValidAccessToken } from "@/services/mail/session"
import { createEmailHistoryEntry } from "@/services/storage/email-history-store"
import { getReport } from "@/services/storage"

export async function POST(request: Request) {
  const parsed = await parseBody(request, composeEmailSchema)
  if ("response" in parsed) return parsed.response
  const input = parsed.data

  const report = await getReport(input.reportId)
  if (!report) return jsonError("Report not found", 404)

  const weekId = formatWeekId(report.meta.year, report.meta.weekNumber)

  try {
    const accessToken = await getValidAccessToken()
    const attachments = await buildMailAttachments(report, input.attachments)
    await getMailProvider().createDraft({
      accessToken,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      body: input.body,
      attachments,
    })

    const entry = await createEmailHistoryEntry({
      reportId: input.reportId,
      weekId,
      subject: input.subject,
      status: "draft",
      trigger: "draft",
      body: input.body,
      to: input.to,
      cc: input.cc,
      attachments: input.attachments,
    })
    return NextResponse.json(entry)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "La création du brouillon a échoué"
    return jsonError(message, 502)
  }
}
