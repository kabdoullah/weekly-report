import { NextResponse } from "next/server"

import { rephraseRequestSchema } from "@/features/ai/types"
import { jsonError, parseBody } from "@/lib/api"
import { getAiProvider } from "@/services/ai"

export async function POST(request: Request) {
  const parsed = await parseBody(request, rephraseRequestSchema)
  if ("response" in parsed) return parsed.response

  try {
    const provider = getAiProvider()
    const results = await provider.rephraseTasks(parsed.data.items)
    return NextResponse.json({ results })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI rephrase failed"
    return jsonError(message, 502)
  }
}
