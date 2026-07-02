import { notificationSchema, type Notification } from "./types/notification.schema"

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchNotifications(): Promise<Notification[]> {
  const data = await request<unknown>("/api/notifications")
  return notificationSchema.array().parse(data)
}

export async function markNotificationRead(id: string): Promise<void> {
  await request<void>(`/api/notifications/${id}/read`, { method: "POST" })
}
