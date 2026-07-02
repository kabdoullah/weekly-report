import { z } from "zod"

/**
 * Recipients/template/auto-send settings for the "Envoi du rapport" module.
 * Zod is the single source of truth; TypeScript types derive from it.
 */

export const emailSettingsSchema = z.object({
  /** Connected Outlook account, or null when not connected. */
  outlookEmail: z.string().nullable(),
  connected: z.boolean(),
  primaryRecipients: z.array(z.email()).default([]),
  ccRecipients: z.array(z.email()).default([]),
  defaultSubject: z.string().trim().default(""),
  defaultBody: z.string().default(""),
  /** "HH:mm", 24h. */
  autoSendTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm requis")
    .default("18:00"),
  autoSendEnabled: z.boolean().default(false),
})
export type EmailSettings = z.infer<typeof emailSettingsSchema>

/** Payload accepted by PUT /api/email/settings (server manages connection state). */
export const emailSettingsInputSchema = emailSettingsSchema.omit({
  outlookEmail: true,
  connected: true,
})
export type EmailSettingsInput = z.infer<typeof emailSettingsInputSchema>

/**
 * Lenient schema for the settings form: recipients are edited as one
 * comma/newline-separated string each, then split with `parseRecipientsList`
 * and re-validated against `emailSettingsInputSchema` before submit — same
 * lenient-then-strict pattern as the report form.
 */
export const emailSettingsFormSchema = emailSettingsInputSchema.extend({
  primaryRecipients: z.string().default(""),
  ccRecipients: z.string().default(""),
})
export type EmailSettingsFormValues = z.infer<typeof emailSettingsFormSchema>

export function parseRecipientsList(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function joinRecipientsList(emails: string[]): string {
  return emails.join(", ")
}
