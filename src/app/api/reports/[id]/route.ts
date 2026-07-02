import { NextResponse } from "next/server"

import { reportInputSchema } from "@/features/report/types/report.schema"
import { jsonError, parseBody } from "@/lib/api"
import { getSession } from "@/services/auth"
import { deleteReport, getReport, updateReport } from "@/services/storage"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return jsonError("Unauthorized", 401)

  const { id } = await params
  const report = await getReport(id, session.userId)
  if (!report) return jsonError("Report not found", 404)
  return NextResponse.json(report)
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return jsonError("Unauthorized", 401)

  const { id } = await params
  const parsed = await parseBody(request, reportInputSchema)
  if ("response" in parsed) return parsed.response

  const existing = await getReport(id, session.userId)
  if (!existing) return jsonError("Report not found", 404)

  const report = await updateReport(id, parsed.data, session.userId)
  return NextResponse.json(report)
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return jsonError("Unauthorized", 401)

  const { id } = await params
  await deleteReport(id, session.userId)
  return new NextResponse(null, { status: 204 })
}
