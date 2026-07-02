import { NextResponse } from "next/server"

import { markNotificationRead } from "@/services/storage/notifications-store"

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params
  await markNotificationRead(id)
  return new NextResponse(null, { status: 204 })
}
