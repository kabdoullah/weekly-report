import { z } from "zod"

/** One row per send/draft/schedule attempt for the "Envoi du rapport" module. */

export const emailStatusSchema = z.enum(["sent", "failed", "draft", "scheduled"])
export type EmailStatus = z.infer<typeof emailStatusSchema>

export const emailTriggerSchema = z.enum([
  "manual",
  "auto",
  "draft",
  "scheduled",
])
export type EmailTrigger = z.infer<typeof emailTriggerSchema>

export const attachmentChoiceSchema = z.enum(["pptx", "pdf", "both"])
export type AttachmentChoice = z.infer<typeof attachmentChoiceSchema>

export const emailHistoryEntrySchema = z.object({
  id: z.string().min(1),
  reportId: z.string().min(1),
  weekId: z.string().min(1),
  subject: z.string(),
  status: emailStatusSchema,
  trigger: emailTriggerSchema,
  scheduledFor: z.iso.datetime().nullable(),
  sentAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  body: z.string(),
  to: z.array(z.email()),
  cc: z.array(z.email()).default([]),
  attachments: attachmentChoiceSchema,
  errorMessage: z.string().nullable(),
})
export type EmailHistoryEntry = z.infer<typeof emailHistoryEntrySchema>
