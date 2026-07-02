import "server-only"

import type { Report } from "@/features/report/types/report.schema"
import { convertPptxToPdf } from "@/services/pdf"
import { generatePptx } from "@/services/pptx"

import type { AttachmentChoice } from "@/features/email/types/email-history.schema"
import type { MailAttachment } from "./types"

const PPTX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
const PDF_CONTENT_TYPE = "application/pdf"

/** Generates the PPTX/PDF attachment(s) for a report, per the chosen format. */
export async function buildMailAttachments(
  report: Report,
  choice: AttachmentChoice
): Promise<MailAttachment[]> {
  const { buffer: pptxBuffer, filename: pptxFilename } = await generatePptx(report)
  const attachments: MailAttachment[] = []

  if (choice === "pptx" || choice === "both") {
    attachments.push({
      filename: pptxFilename,
      contentType: PPTX_CONTENT_TYPE,
      contentBytes: pptxBuffer.toString("base64"),
    })
  }

  if (choice === "pdf" || choice === "both") {
    const pdfBuffer = await convertPptxToPdf(pptxBuffer)
    attachments.push({
      filename: pptxFilename.replace(/\.pptx$/, ".pdf"),
      contentType: PDF_CONTENT_TYPE,
      contentBytes: pdfBuffer.toString("base64"),
    })
  }

  return attachments
}
