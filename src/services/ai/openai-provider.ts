import OpenAI from "openai"

import { buildRephraseUserPrompt, REPHRASE_SYSTEM_PROMPT } from "./prompt"
import type { AiProvider, RephraseInput } from "./types"

/**
 * OpenAI implementation of AiProvider. Server-side only — instantiated from the
 * factory in `./index.ts`. Never import this from client components.
 */
export class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI
  private readonly model: string

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey })
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

    return completion.choices[0]?.message?.content?.trim() ?? input.text
  }

  async rephraseTasks(inputs: RephraseInput[]): Promise<string[]> {
    return Promise.all(inputs.map((input) => this.rephraseTask(input)))
  }
}
