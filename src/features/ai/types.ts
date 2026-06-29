import { z } from "zod"

/**
 * Client-safe AI request/response contracts. Kept out of `services/ai` (which is
 * `server-only`) so the form and hooks can import these types and validate input.
 */

export const rephraseItemSchema = z.object({
  text: z.string().trim().min(1),
  project: z.string().trim().optional(),
  module: z.string().trim().optional(),
})

export const rephraseRequestSchema = z.object({
  items: z.array(rephraseItemSchema).min(1).max(50),
})

export type RephraseRequest = z.infer<typeof rephraseRequestSchema>

export const rephraseResponseSchema = z.object({
  results: z.array(z.string()),
})

export type RephraseResponse = z.infer<typeof rephraseResponseSchema>
