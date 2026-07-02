import { NextResponse } from "next/server"

import { jsonError } from "@/lib/api"
import { getMailProvider } from "@/services/mail"
import { buildMailAttachments } from "@/services/mail/attachments"
import { getValidAccessToken } from "@/services/mail/session"
import {
  createEmailHistoryEntry,
  getEmailHistoryEntry,
} from "@/services/storage/email-history-store"
import { getReport } from "@/services/storage"

type Params = { params: Promise<{ id: string }> }

/** Replays a failed send/draft/scheduled attempt with its original content. */
export async function POST(_request: Request, { params }: Params) {
  const { id } = await params
  const entry = await getEmailHistoryEntry(id)
  if (!entry) return jsonError("Email history entry not found", 404)
  if (entry.status !== "failed") {
    return jsonError("Only failed attempts can be resent", 400)
  }

  const report = await getReport(entry.reportId)
  if (!report) return jsonError("Report not found", 404)

  try {
    const accessToken = await getValidAccessToken()
    const attachments = await buildMailAttachments(report, entry.attachments)
    await getMailProvider().sendMail({
      accessToken,
      to: entry.to,
      cc: entry.cc,
      subject: entry.subject,
      body: entry.body,
      attachments,
    })

    const resent = await createEmailHistoryEntry({
      reportId: entry.reportId,
      weekId: entry.weekId,
      subject: entry.subject,
      status: "sent",
      trigger: entry.trigger,
      sentAt: new Date().toISOString(),
      body: entry.body,
      to: entry.to,
      cc: entry.cc,
      attachments: entry.attachments,
    })
    return NextResponse.json(resent)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Le renvoi a échoué"
    await createEmailHistoryEntry({
      reportId: entry.reportId,
      weekId: entry.weekId,
      subject: entry.subject,
      status: "failed",
      trigger: entry.trigger,
      body: entry.body,
      to: entry.to,
      cc: entry.cc,
      attachments: entry.attachments,
      errorMessage: message,
    })
    return jsonError(message, 502)
  }
}
