import "server-only"

import { getMicrosoftTokens, saveMicrosoftTokens } from "@/services/storage/token-store"

import { getMailProvider } from "./index"

const EXPIRY_BUFFER_MS = 60_000

/**
 * Returns a valid access token for the connected Outlook account, refreshing
 * it (and persisting the refreshed token set) if it's expired or about to be.
 */
export async function getValidAccessToken(): Promise<string> {
  const stored = await getMicrosoftTokens()
  if (!stored) {
    throw new Error(
      "Aucun compte Outlook connecté. Rendez-vous dans Paramètres pour vous connecter."
    )
  }

  if (Date.now() < stored.tokens.expiresAt - EXPIRY_BUFFER_MS) {
    return stored.tokens.accessToken
  }

  const provider = getMailProvider()
  const refreshed = await provider.refreshAccessToken(stored.tokens.refreshToken)
  await saveMicrosoftTokens(refreshed, stored.accountEmail ?? "")
  return refreshed.accessToken
}
