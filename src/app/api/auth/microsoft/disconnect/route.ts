import { NextResponse } from "next/server"

import { clearMicrosoftTokens } from "@/services/storage/token-store"

export async function POST() {
  await clearMicrosoftTokens()
  return new NextResponse(null, { status: 204 })
}
