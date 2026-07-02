import { NextResponse } from "next/server"

import { destroySession } from "@/services/auth"

export async function POST() {
  await destroySession()
  return new NextResponse(null, { status: 204 })
}
