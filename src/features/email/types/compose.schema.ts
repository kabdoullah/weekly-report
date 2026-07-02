import { z } from "zod"

import { attachmentChoiceSchema } from "./email-history.schema"

/** Shared body for send/draft (and later schedule) requests. */
export const composeEmailSchema = z.object({
  reportId: z.string().min(1),
  subject: z.string().trim().min(1, "Objet requis"),
  body: z.string(),
  to: z.array(z.email()).min(1, "Au moins un destinataire requis"),
  cc: z.array(z.email()).default([]),
  attachments: attachmentChoiceSchema,
})
export type ComposeEmailInput = z.infer<typeof composeEmailSchema>

/** Body for POST /api/email/schedule — same fields plus the future send time. */
export const scheduleEmailSchema = composeEmailSchema.extend({
  scheduledFor: z.iso.datetime(),
})
export type ScheduleEmailInput = z.infer<typeof scheduleEmailSchema>
