import "server-only"

import { MicrosoftGraphProvider } from "./microsoft-graph-provider"
import type { MailProvider } from "./types"

export type {
  MailAttachment,
  MailProvider,
  MailTokenSet,
  SendMailParams,
} from "./types"
export { buildDefaultBody, buildDefaultSubject } from "./template"

/**
 * Resolves the active mail provider from env. Add a new `case` here to
 * support another provider — callers never change.
 */
export function getMailProvider(): MailProvider {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const tenantId = process.env.MICROSOFT_TENANT_ID
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI

  if (!clientId || !clientSecret || !tenantId || !redirectUri) {
    throw new Error(
      "Microsoft Graph is not configured. Set MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID, MICROSOFT_REDIRECT_URI."
    )
  }

  return new MicrosoftGraphProvider({
    clientId,
    clientSecret,
    tenantId,
    redirectUri,
  })
}
