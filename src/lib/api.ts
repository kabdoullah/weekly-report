import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * Small helpers shared by route handlers: consistent JSON error envelopes,
 * body validation, and Content-Disposition for file downloads.
 */

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Parse + validate a JSON request body against a Zod schema. */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ data: T } | { response: NextResponse }> {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return { response: jsonError("Invalid JSON body") }
  }

  const result = schema.safeParse(payload)
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: "Validation failed", issues: z.treeifyError(result.error) },
        { status: 422 }
      ),
    }
  }
  return { data: result.data }
}

/** RFC 5987 Content-Disposition that survives spaces and accents in filenames. */
export function attachment(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "")
  const encoded = encodeURIComponent(filename)
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`
}
