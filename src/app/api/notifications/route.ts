import { NextResponse } from "next/server"

import { listNotifications } from "@/services/storage/notifications-store"

export async function GET() {
  const notifications = await listNotifications()
  return NextResponse.json(notifications)
}
