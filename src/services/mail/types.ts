/**
 * Provider-agnostic mail contract. Callers depend only on this interface so
 * the concrete provider (Microsoft Graph today) can be swapped via the
 * factory in `./index.ts` with no changes upstream.
 */

export interface MailTokenSet {
  accessToken: string
  refreshToken: string
  /** Epoch ms when `accessToken` expires. */
  expiresAt: number
  scope: string
}

export interface MailAttachment {
  filename: string
  contentType: string
  /** Base64-encoded file content. */
  contentBytes: string
}

export interface SendMailParams {
  accessToken: string
  to: string[]
  cc: string[]
  subject: string
  body: string
  attachments: MailAttachment[]
}

export interface MailProvider {
  /** Build the provider's OAuth consent URL. `state` is an opaque CSRF token. */
  getAuthUrl(state: string): Promise<string>

  /** Exchange an authorization code for a token set. */
  exchangeCode(code: string): Promise<MailTokenSet>

  /** Redeem a refresh token for a fresh token set. */
  refreshAccessToken(refreshToken: string): Promise<MailTokenSet>

  /** Send an email as the authenticated user. */
  sendMail(params: SendMailParams): Promise<void>

  /** Create a draft in the user's mailbox (visible in their real Drafts folder). */
  createDraft(params: SendMailParams): Promise<{ draftId: string }>

  /** Fetch the connected account's profile (email + display name). */
  getProfile(accessToken: string): Promise<{ email: string; displayName: string }>
}
