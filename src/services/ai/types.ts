/**
 * Provider-agnostic AI contract. Callers depend only on this interface so the
 * concrete provider (OpenAI today, Claude later) can be swapped via the factory
 * in `./index.ts` with no changes upstream.
 */

export interface RephraseInput {
  /** Raw task line written by the user, e.g. "ajout permission accounts". */
  text: string
  /** Optional context to sharpen the rewrite. */
  project?: string
  module?: string
}

export interface AiProvider {
  /**
   * Rewrite one raw task into a professional, CTO-ready French sentence.
   */
  rephraseTask(input: RephraseInput): Promise<string>

  /**
   * Rewrite many tasks in one round-trip. Returns rewrites in input order.
   */
  rephraseTasks(inputs: RephraseInput[]): Promise<string[]>
}

export type AiProviderName = "openai" | "anthropic"
