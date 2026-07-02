import { z } from "zod"

/** In-app notifications, populated by the scheduler (Friday auto-send, scheduled sends). */

export const notificationTypeSchema = z.enum([
  "auto_send_success",
  "auto_send_failed",
  "auto_send_no_report",
  "scheduled_send_failed",
])
export type NotificationType = z.infer<typeof notificationTypeSchema>

export const notificationSchema = z.object({
  id: z.string().min(1),
  type: notificationTypeSchema,
  read: z.boolean(),
  createdAt: z.iso.datetime(),
  message: z.string(),
  link: z.string().nullable(),
})
export type Notification = z.infer<typeof notificationSchema>
