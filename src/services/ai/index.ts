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
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set")
      }
      return new OpenAiProvider(apiKey, process.env.OPENAI_MODEL)
    }
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${provider}`)
  }
}
