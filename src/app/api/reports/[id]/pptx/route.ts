import { NextResponse } from "next/server"

import { attachment, jsonError } from "@/lib/api"
import { generatePptx } from "@/services/pptx"
import { getReport } from "@/services/storage"

const PPTX_MIME =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const report = await getReport(id)
  if (!report) return jsonError("Report not found", 404)

  const { buffer, filename } = await generatePptx(report)
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": PPTX_MIME,
      "Content-Disposition": attachment(filename),
    },
  })
}
