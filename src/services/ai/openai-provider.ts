import OpenAI from "openai"

import { buildRephraseUserPrompt, REPHRASE_SYSTEM_PROMPT } from "./prompt"
import type { AiProvider, RephraseInput } from "./types"

export interface OpenAiProviderOptions {
  apiKey: string
  model?: string
  /** Override for OpenAI-compatible endpoints (Ollama, Groq, …). */
  baseURL?: string
}

/**
 * OpenAI-compatible implementation of AiProvider. Works with the OpenAI API and
 * any compatible endpoint (Ollama, Groq, OpenRouter…) via `baseURL`. Server-side
 * only — instantiated from the factory in `./index.ts`. Never import this from
 * client components.
 */
export class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI
  private readonly model: string

  constructor({ apiKey, model = "gpt-4o-mini", baseURL }: OpenAiProviderOptions) {
    this.client = new OpenAI({ apiKey, baseURL })
    this.model = model
  }

  async rephraseTask(input: RephraseInput): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: REPHRASE_SYSTEM_PROMPT },
        { role: "user", content: buildRephraseUserPrompt(input) },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    return raw ? stripWrappingQuotes(raw) : input.text
  }

  async rephraseTasks(inputs: RephraseInput[]): Promise<string[]> {
    return Promise.all(inputs.map((input) => this.rephraseTask(input)))
  }
}

/** Some models wrap their answer in quotes — remove a single surrounding pair. */
function stripWrappingQuotes(text: string): string {
  const match = text.match(/^["'«»“”]([\s\S]*)["'«»“”]$/)
  return match ? match[1].trim() : text
}
