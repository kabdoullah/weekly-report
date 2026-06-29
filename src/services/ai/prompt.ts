import type { RephraseInput } from "./types"

/**
 * Shared system prompt + per-task user prompt. Kept provider-agnostic so every
 * AiProvider implementation produces the same tone and format.
 */
export const REPHRASE_SYSTEM_PROMPT = `Tu es un assistant qui reformule des tâches techniques brutes en phrases professionnelles, claires et concises, en français.
Règles :
- Ton professionnel, prêt à être envoyé à un CTO.
- Une seule phrase par tâche, sans puce ni numéro.
- Garde le sens technique exact ; n'invente rien.
- Mentionne le module concerné quand il est fourni.
Exemples :
"ajout permission accounts" -> "Ajout des permissions du module Accounts au backend."
"fix image forum" -> "Correction de l'affichage des images sur les cartes du module Forum."`

export function buildRephraseUserPrompt(input: RephraseInput): string {
  const ctx = [
    input.project ? `Projet : ${input.project}` : null,
    input.module ? `Module : ${input.module}` : null,
  ]
    .filter(Boolean)
    .join(" | ")

  return `${ctx ? ctx + "\n" : ""}Tâche brute : "${input.text}"\nReformulation :`
}
