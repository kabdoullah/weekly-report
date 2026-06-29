import {
  rephraseResponseSchema,
  type RephraseRequest,
} from "./types"

/** Client for the AI rephrase endpoint. */
export async function rephraseTasks(
  request: RephraseRequest
): Promise<string[]> {
  const res = await fetch("/api/ai/rephrase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    let message = `Reformulation échouée (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default */
    }
    throw new Error(message)
  }

  const { results } = rephraseResponseSchema.parse(await res.json())
  return results
}
