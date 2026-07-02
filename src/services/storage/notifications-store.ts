import "server-only"

import { randomUUID } from "node:crypto"

import {
  notificationSchema,
  type Notification,
  type NotificationType,
} from "@/features/notifications/types/notification.schema"

import { getDb } from "./db"

/** In-app notifications, one row per event. Server-only. */

interface NotificationRow {
  id: string
  type: string
  read: number
  created_at: string
  data: string
}

interface StoredData {
  message: string
  link: string | null
}

function parseRow(row: NotificationRow): Notification {
  const data = JSON.parse(row.data) as StoredData
  return notificationSchema.parse({
    id: row.id,
    type: row.type,
    read: row.read === 1,
    createdAt: row.created_at,
    ...data,
  })
}

export async function listNotifications(): Promise<Notification[]> {
  const rows = getDb()
    .prepare("SELECT * FROM notifications ORDER BY created_at DESC")
    .all() as NotificationRow[]
  return rows.map(parseRow)
}

export async function createNotification(input: {
  type: NotificationType
  message: string
  link?: string | null
}): Promise<Notification> {
  const id = randomUUID()
  const createdAt = new Date().toISOString()
  const data: StoredData = { message: input.message, link: input.link ?? null }

  getDb()
    .prepare(
      `INSERT INTO notifications (id, type, read, created_at, data)
       VALUES (@id, @type, 0, @createdAt, @data)`
    )
    .run({ id, type: input.type, createdAt, data: JSON.stringify(data) })

  return parseRow(
    getDb().prepare("SELECT * FROM notifications WHERE id = ?").get(id) as NotificationRow
  )
}

export async function markNotificationRead(id: string): Promise<void> {
  getDb().prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(id)
}
