import {
  composeEmailSchema,
  scheduleEmailSchema,
  type ComposeEmailInput,
  type ScheduleEmailInput,
} from "./types/compose.schema"
import {
  emailHistoryEntrySchema,
  type EmailHistoryEntry,
  type EmailStatus,
} from "./types/email-history.schema"
import {
  emailSettingsSchema,
  type EmailSettings,
  type EmailSettingsInput,
} from "./types/email-settings.schema"

/**
 * Typed client for the email-sending API. Validates responses with Zod so the
 * rest of the UI can trust the shapes. Mirrors `src/features/report/api.ts`.
 */

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchEmailSettings(): Promise<EmailSettings> {
  const data = await request<unknown>("/api/email/settings")
  return emailSettingsSchema.parse(data)
}

export async function updateEmailSettings(
  input: EmailSettingsInput
): Promise<EmailSettings> {
  const data = await request<unknown>("/api/email/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  })
  return emailSettingsSchema.parse(data)
}

export async function sendReportEmail(
  input: ComposeEmailInput
): Promise<EmailHistoryEntry> {
  const data = await request<unknown>("/api/email/send", {
    method: "POST",
    body: JSON.stringify(composeEmailSchema.parse(input)),
  })
  return emailHistoryEntrySchema.parse(data)
}

export async function draftReportEmail(
  input: ComposeEmailInput
): Promise<EmailHistoryEntry> {
  const data = await request<unknown>("/api/email/draft", {
    method: "POST",
    body: JSON.stringify(composeEmailSchema.parse(input)),
  })
  return emailHistoryEntrySchema.parse(data)
}

export async function scheduleReportEmail(
  input: ScheduleEmailInput
): Promise<EmailHistoryEntry> {
  const data = await request<unknown>("/api/email/schedule", {
    method: "POST",
    body: JSON.stringify(scheduleEmailSchema.parse(input)),
  })
  return emailHistoryEntrySchema.parse(data)
}

export async function fetchEmailHistory(
  status?: EmailStatus
): Promise<EmailHistoryEntry[]> {
  const query = status ? `?status=${status}` : ""
  const data = await request<unknown>(`/api/email/history${query}`)
  return emailHistoryEntrySchema.array().parse(data)
}

export async function resendEmail(id: string): Promise<EmailHistoryEntry> {
  const data = await request<unknown>(`/api/email/history/${id}/resend`, {
    method: "POST",
  })
  return emailHistoryEntrySchema.parse(data)
}
