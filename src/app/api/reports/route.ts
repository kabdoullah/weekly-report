import { NextResponse } from "next/server"

import { reportInputSchema } from "@/features/report/types/report.schema"
import { parseBody } from "@/lib/api"
import { createReport, listReports } from "@/services/storage"

export async function GET() {
  const reports = await listReports()
  return NextResponse.json(reports)
}

export async function POST(request: Request) {
  const parsed = await parseBody(request, reportInputSchema)
  if ("response" in parsed) return parsed.response

  const report = await createReport(parsed.data)
  return NextResponse.json(report, { status: 201 })
}
