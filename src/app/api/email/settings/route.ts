import { NextResponse } from "next/server"

import { emailSettingsInputSchema } from "@/features/email/types/email-settings.schema"
import { parseBody } from "@/lib/api"
import {
  getEmailSettings,
  upsertEmailSettings,
} from "@/services/storage/email-settings-store"

export async function GET() {
  const settings = await getEmailSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const parsed = await parseBody(request, emailSettingsInputSchema)
  if ("response" in parsed) return parsed.response

  const settings = await upsertEmailSettings(parsed.data)
  return NextResponse.json(settings)
}
