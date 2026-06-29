import { NextResponse } from "next/server"

import { reportInputSchema } from "@/features/report/types/report.schema"
import { jsonError, parseBody } from "@/lib/api"
import { deleteReport, getReport, updateReport } from "@/services/storage"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params
  const report = await getReport(id)
  if (!report) return jsonError("Report not found", 404)
  return NextResponse.json(report)
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const parsed = await parseBody(request, reportInputSchema)
  if ("response" in parsed) return parsed.response

  const existing = await getReport(id)
  if (!existing) return jsonError("Report not found", 404)

  const report = await updateReport(id, parsed.data)
  return NextResponse.json(report)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  await deleteReport(id)
  return new NextResponse(null, { status: 204 })
}
