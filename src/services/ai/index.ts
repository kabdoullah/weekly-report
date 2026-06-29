import "server-only"

import { OpenAiProvider } from "./openai-provider"
import type { AiProvider, AiProviderName } from "./types"

export type { AiProvider, RephraseInput } from "./types"

/**
 * Resolves the active AI provider from env. Add a new `case` here to support
 * another provider (e.g. Anthropic) — callers never change.
 */
export function getAiProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER ?? "openai") as AiProviderName

  switch (provider) {
    case "openai": {
      const baseURL = process.env.OPENAI_BASE_URL
      // A custom baseURL means an OpenAI-compatible endpoint (Ollama, Groq…).
      // Local Ollama needs no real key, so fall back to a placeholder there.
      const apiKey = process.env.OPENAI_API_KEY ?? (baseURL ? "not-needed" : "")
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set")
      }
      return new OpenAiProvider({
        apiKey,
        model: process.env.OPENAI_MODEL,
        baseURL,
      })
    }
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`)
  }
}
