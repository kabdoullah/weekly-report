import "server-only"

import { decrypt, encrypt, getEncryptionKey } from "@/lib/crypto"

import { getDb } from "./db"

/**
 * Encrypted Microsoft Graph OAuth tokens, single row (id = "default").
 * Server-only. Swap for another backend without touching callers.
 */

const ROW_ID = "default"

export interface MicrosoftTokenSet {
  accessToken: string
  refreshToken: string
  /** Epoch ms when `accessToken` expires. */
  expiresAt: number
  scope: string
}

interface TokenRow {
  account_email: string | null
  iv: string
  auth_tag: string
  ciphertext: string
}

export async function getMicrosoftTokens(): Promise<{
  accountEmail: string | null
  tokens: MicrosoftTokenSet
} | null> {
  const row = getDb()
    .prepare(
      "SELECT account_email, iv, auth_tag, ciphertext FROM microsoft_tokens WHERE id = ?"
    )
    .get(ROW_ID) as TokenRow | undefined
  if (!row) return null

  const key = getEncryptionKey()
  const plaintext = decrypt(
    { iv: row.iv, authTag: row.auth_tag, ciphertext: row.ciphertext },
    key
  )
  return {
    accountEmail: row.account_email,
    tokens: JSON.parse(plaintext) as MicrosoftTokenSet,
  }
}

export async function saveMicrosoftTokens(
  tokens: MicrosoftTokenSet,
  accountEmail: string
): Promise<void> {
  const key = getEncryptionKey()
  const { iv, authTag, ciphertext } = encrypt(JSON.stringify(tokens), key)

  getDb()
    .prepare(
      `INSERT INTO microsoft_tokens (id, account_email, iv, auth_tag, ciphertext, updated_at)
       VALUES (@id, @accountEmail, @iv, @authTag, @ciphertext, @updatedAt)
       ON CONFLICT(id) DO UPDATE SET
         account_email = @accountEmail,
         iv = @iv,
         auth_tag = @authTag,
         ciphertext = @ciphertext,
         updated_at = @updatedAt`
    )
    .run({
      id: ROW_ID,
      accountEmail,
      iv,
      authTag,
      ciphertext,
      updatedAt: new Date().toISOString(),
    })
}

export async function clearMicrosoftTokens(): Promise<void> {
  getDb().prepare("DELETE FROM microsoft_tokens WHERE id = ?").run(ROW_ID)
}
