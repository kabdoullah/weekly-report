import { NextResponse } from "next/server"

import { reportInputSchema } from "@/features/report/types/report.schema"
import { jsonError, parseBody } from "@/lib/api"
import { getSession } from "@/services/auth"
import { createReport, listReports } from "@/services/storage"

export async function GET() {
  const session = await getSession()
  if (!session) return jsonError("Unauthorized", 401)

  const reports = await listReports(session.userId)
  return NextResponse.json(reports)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return jsonError("Unauthorized", 401)

  const parsed = await parseBody(request, reportInputSchema)
  if ("response" in parsed) return parsed.response

  const report = await createReport(parsed.data, session.userId)
  return NextResponse.json(report, { status: 201 })
}
