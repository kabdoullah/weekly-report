import { NextResponse } from "next/server"

import { attachment, jsonError } from "@/lib/api"
import { convertPptxToPdf } from "@/services/pdf"
import { generatePptx } from "@/services/pptx"
import { getReport } from "@/services/storage"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const report = await getReport(id)
  if (!report) return jsonError("Report not found", 404)

  const { buffer, filename } = await generatePptx(report)
  const pdf = await convertPptxToPdf(buffer)
  const pdfName = filename.replace(/\.pptx$/, ".pdf")

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": attachment(pdfName),
    },
  })
}
