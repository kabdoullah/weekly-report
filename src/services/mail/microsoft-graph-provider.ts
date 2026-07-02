import "server-only"

import { ConfidentialClientApplication } from "@azure/msal-node"

import type {
  MailAttachment,
  MailProvider,
  MailTokenSet,
  SendMailParams,
} from "./types"

export interface MicrosoftGraphProviderOptions {
  clientId: string
  clientSecret: string
  tenantId: string
  redirectUri: string
}

const SCOPES = [
  "https://graph.microsoft.com/Mail.Send",
  "https://graph.microsoft.com/Mail.ReadWrite",
  "https://graph.microsoft.com/User.Read",
  "offline_access",
]

const GRAPH_BASE = "https://graph.microsoft.com/v1.0"

/**
 * Delegated-permission Microsoft Graph implementation of MailProvider.
 * Uses `@azure/msal-node` for the Authorization Code flow (token exchange +
 * refresh); the caller is responsible for persisting the returned
 * `MailTokenSet` (see `src/services/storage/token-store.ts`) — this provider
 * keeps no state of its own between calls.
 */
export class MicrosoftGraphProvider implements MailProvider {
  private readonly cca: ConfidentialClientApplication
  private readonly redirectUri: string

  constructor({
    clientId,
    clientSecret,
    tenantId,
    redirectUri,
  }: MicrosoftGraphProviderOptions) {
    this.redirectUri = redirectUri
    this.cca = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: `https://login.microsoftonline.com/${tenantId}`,
      },
    })
  }

  async getAuthUrl(state: string): Promise<string> {
    return this.cca.getAuthCodeUrl({
      scopes: SCOPES,
      redirectUri: this.redirectUri,
      state,
    })
  }

  async exchangeCode(code: string): Promise<MailTokenSet> {
    const result = await this.cca.acquireTokenByCode({
      code,
      scopes: SCOPES,
      redirectUri: this.redirectUri,
    })
    return this.toTokenSet(result)
  }

  async refreshAccessToken(refreshToken: string): Promise<MailTokenSet> {
    const result = await this.cca.acquireTokenByRefreshToken({
      refreshToken,
      scopes: SCOPES,
    })
    if (!result) {
      throw new Error("Microsoft refresh token exchange returned no result")
    }
    return this.toTokenSet(result)
  }

  private toTokenSet(result: {
    accessToken: string
    expiresOn: Date | null
    scopes: string[]
  }): MailTokenSet {
    const refreshToken = this.extractRefreshToken()
    if (!refreshToken) {
      throw new Error(
        "No refresh token in Microsoft response — check that offline_access is granted"
      )
    }
    return {
      accessToken: result.accessToken,
      refreshToken,
      expiresAt: (result.expiresOn ?? new Date()).getTime(),
      scope: result.scopes.join(" "),
    }
  }

  /** msal-node keeps refresh tokens in its in-memory cache, not on the result. */
  private extractRefreshToken(): string | null {
    const cache = JSON.parse(this.cca.getTokenCache().serialize()) as {
      RefreshToken?: Record<string, { secret: string }>
    }
    const entries = Object.values(cache.RefreshToken ?? {})
    return entries.at(-1)?.secret ?? null
  }

  async sendMail(params: SendMailParams): Promise<void> {
    await graphFetch(params.accessToken, "/me/sendMail", {
      message: toGraphMessage(params),
      saveToSentItems: true,
    })
  }

  async createDraft(params: SendMailParams): Promise<{ draftId: string }> {
    const draft = (await graphFetch(
      params.accessToken,
      "/me/mailFolders/drafts/messages",
      toGraphMessage(params)
    )) as { id: string }
    return { draftId: draft.id }
  }

  async getProfile(
    accessToken: string
  ): Promise<{ email: string; displayName: string }> {
    const profile = (await graphFetch(accessToken, "/me", undefined, "GET")) as {
      mail?: string
      userPrincipalName: string
      displayName: string
    }
    return {
      email: profile.mail ?? profile.userPrincipalName,
      displayName: profile.displayName,
    }
  }
}

function toGraphMessage(params: SendMailParams) {
  return {
    subject: params.subject,
    body: { contentType: "Text", content: params.body },
    toRecipients: params.to.map(toRecipient),
    ccRecipients: params.cc.map(toRecipient),
    attachments: params.attachments.map(toGraphAttachment),
  }
}

function toRecipient(address: string) {
  return { emailAddress: { address } }
}

function toGraphAttachment(attachment: MailAttachment) {
  return {
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: attachment.filename,
    contentType: attachment.contentType,
    contentBytes: attachment.contentBytes,
  }
}

async function graphFetch(
  accessToken: string,
  path: string,
  body?: unknown,
  method: "GET" | "POST" = "POST"
): Promise<unknown> {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(
      `Microsoft Graph request failed (${res.status} ${path}): ${detail}`
    )
  }
  if (res.status === 202 || res.status === 204) return null
  return res.json()
}
