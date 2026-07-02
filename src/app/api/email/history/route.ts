import { NextResponse } from "next/server"

import { emailStatusSchema } from "@/features/email/types/email-history.schema"
import { listEmailHistory } from "@/services/storage/email-history-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get("status")
  const status = statusParam
    ? emailStatusSchema.safeParse(statusParam).data
    : undefined

  const history = await listEmailHistory(status ? { status } : undefined)
  return NextResponse.json(history)
}
