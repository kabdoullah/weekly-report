import "server-only"

import {
  emailSettingsSchema,
  type EmailSettings,
  type EmailSettingsInput,
} from "@/features/email/types/email-settings.schema"
import { DEFAULT_BODY_TEMPLATE } from "@/services/mail/template"

import { getDb } from "./db"
import { getMicrosoftTokens } from "./token-store"

/**
 * Recipients/template/auto-send settings, single row (id = "default").
 * Server-only. The connection state (`outlookEmail`/`connected`) is derived
 * from `microsoft_tokens`, not stored redundantly here.
 */

const ROW_ID = "default"

interface SettingsRow {
  data: string
}

interface StoredSettings {
  primaryRecipients: string[]
  ccRecipients: string[]
  defaultSubject: string
  defaultBody: string
  autoSendTime: string
  autoSendEnabled: boolean
}

function defaults(): StoredSettings {
  return {
    primaryRecipients: [],
    ccRecipients: [],
    defaultSubject: "",
    defaultBody: DEFAULT_BODY_TEMPLATE,
    autoSendTime: "18:00",
    autoSendEnabled: false,
  }
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const row = getDb()
    .prepare("SELECT data FROM email_settings WHERE id = ?")
    .get(ROW_ID) as SettingsRow | undefined
  const stored: StoredSettings = row ? JSON.parse(row.data) : defaults()

  const account = await getMicrosoftTokens()

  return emailSettingsSchema.parse({
    ...stored,
    outlookEmail: account?.accountEmail ?? null,
    connected: account !== null,
  })
}

export async function upsertEmailSettings(
  input: EmailSettingsInput
): Promise<EmailSettings> {
  getDb()
    .prepare(
      `INSERT INTO email_settings (id, outlook_email, data, updated_at)
       VALUES (@id, NULL, @data, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET data = @data, updated_at = @updatedAt`
    )
    .run({
      id: ROW_ID,
      data: JSON.stringify(input),
      updatedAt: new Date().toISOString(),
    })

  return getEmailSettings()
}
