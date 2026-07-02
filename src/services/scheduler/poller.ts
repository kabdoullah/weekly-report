import "server-only"

import { currentHHmm, isFriday } from "@/lib/timezone"
import { formatWeekId, getWeekInfo } from "@/lib/week"
import { getMailProvider, buildDefaultBody, buildDefaultSubject } from "@/services/mail"
import { buildMailAttachments } from "@/services/mail/attachments"
import { getValidAccessToken } from "@/services/mail/session"
import { getReport, listReports } from "@/services/storage"
import {
  createEmailHistoryEntry,
  listEmailHistory,
  hasSentForWeek,
  updateEmailHistoryStatus,
} from "@/services/storage/email-history-store"
import { getEmailSettings } from "@/services/storage/email-settings-store"
import { createNotification } from "@/services/storage/notifications-store"

/**
 * Every-minute poller: fires the Friday-18h auto-send and flushes any
 * scheduled sends that are due. Started once per server process from
 * `src/instrumentation.ts`.
 */

const TICK_MS = 60_000

let intervalHandle: ReturnType<typeof setInterval> | null = null
let isRunning = false

export function startScheduler(): void {
  if (intervalHandle) return
  intervalHandle = setInterval(() => {
    void tick()
  }, TICK_MS)
}

async function tick(): Promise<void> {
  if (isRunning) return
  isRunning = true
  try {
    await checkAutoSend()
    await checkScheduledSends()
  } catch (error) {
    console.error("[scheduler] tick failed:", error)
  } finally {
    isRunning = false
  }
}

async function checkAutoSend(): Promise<void> {
  const settings = await getEmailSettings()
  if (!settings.autoSendEnabled || !settings.connected) return
  if (!isFriday() || currentHHmm() !== settings.autoSendTime) return

  const { year, weekNumber } = getWeekInfo()
  const weekId = formatWeekId(year, weekNumber)
  if (await hasSentForWeek(weekId)) return

  const summary = (await listReports()).find(
    (s) => s.meta.year === year && s.meta.weekNumber === weekNumber
  )
  if (!summary) {
    await createNotification({
      type: "auto_send_no_report",
      message: `Aucun rapport créé pour la semaine ${weekId} — envoi automatique annulé.`,
    })
    return
  }

  const report = await getReport(summary.id)
  if (!report) return

  const subject = settings.defaultSubject || buildDefaultSubject(report.meta)
  const body = buildDefaultBody(report.meta.name, settings.defaultBody || undefined)

  try {
    const accessToken = await getValidAccessToken()
    const attachments = await buildMailAttachments(report, "pdf")
    await getMailProvider().sendMail({
      accessToken,
      to: settings.primaryRecipients,
      cc: settings.ccRecipients,
      subject,
      body,
      attachments,
    })
    await createEmailHistoryEntry({
      reportId: report.id,
      weekId,
      subject,
      status: "sent",
      trigger: "auto",
      sentAt: new Date().toISOString(),
      body,
      to: settings.primaryRecipients,
      cc: settings.ccRecipients,
      attachments: "pdf",
    })
    await createNotification({
      type: "auto_send_success",
      message: `Rapport ${weekId} envoyé automatiquement.`,
      link: `/reports/${report.id}`,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Échec de l'envoi automatique"
    await createEmailHistoryEntry({
      reportId: report.id,
      weekId,
      subject,
      status: "failed",
      trigger: "auto",
      body,
      to: settings.primaryRecipients,
      cc: settings.ccRecipients,
      attachments: "pdf",
      errorMessage: message,
    })
    await createNotification({
      type: "auto_send_failed",
      message: `L'envoi automatique du rapport ${weekId} a échoué : ${message}`,
      link: "/history",
    })
  }
}

async function checkScheduledSends(): Promise<void> {
  const now = new Date()
  const due = (await listEmailHistory({ status: "scheduled" })).filter(
    (entry) => entry.scheduledFor && new Date(entry.scheduledFor) <= now
  )

  for (const entry of due) {
    const report = await getReport(entry.reportId)
    if (!report) {
      await updateEmailHistoryStatus(entry.id, "failed", {
        errorMessage: "Rapport introuvable",
      })
      continue
    }

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
      await updateEmailHistoryStatus(entry.id, "sent", {
        sentAt: new Date().toISOString(),
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec de l'envoi programmé"
      await updateEmailHistoryStatus(entry.id, "failed", { errorMessage: message })
      await createNotification({
        type: "scheduled_send_failed",
        message: `L'envoi programmé de "${entry.subject}" a échoué : ${message}`,
        link: "/history",
      })
    }
  }
}
