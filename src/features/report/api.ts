import {
  reportSchema,
  reportSummarySchema,
  type Report,
  type ReportInput,
  type ReportSummary,
} from "./types/report.schema"

/**
 * Typed client for the reports API. Validates responses with Zod so the rest of
 * the UI can trust the shapes. Used by the TanStack Query hooks.
 */

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchReports(): Promise<ReportSummary[]> {
  const data = await request<unknown>("/api/reports")
  return reportSummarySchema.array().parse(data)
}

export async function fetchReport(id: string): Promise<Report> {
  const data = await request<unknown>(`/api/reports/${id}`)
  return reportSchema.parse(data)
}

export async function createReport(input: ReportInput): Promise<Report> {
  const data = await request<unknown>("/api/reports", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return reportSchema.parse(data)
}

export async function updateReport(
  id: string,
  input: ReportInput
): Promise<Report> {
  const data = await request<unknown>(`/api/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
  return reportSchema.parse(data)
}

export async function deleteReport(id: string): Promise<void> {
  await request<void>(`/api/reports/${id}`, { method: "DELETE" })
}

export type DownloadFormat = "pptx" | "pdf"

/** Triggers a browser download of the generated file (attachment headers). */
export function downloadReport(id: string, format: DownloadFormat): void {
  const link = document.createElement("a")
  link.href = `/api/reports/${id}/${format}`
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
}
