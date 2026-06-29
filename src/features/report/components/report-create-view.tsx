"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCreateReport } from "../hooks/use-reports"
import type { ReportInput } from "../types/report.schema"
import { createEmptyReport } from "../utils/report-factory"
import { ReportForm } from "./report-form"

export function ReportCreateView() {
  const router = useRouter()
  const create = useCreateReport()
  const defaultValues = React.useMemo(() => createEmptyReport(), [])

  async function handleSubmit(input: ReportInput) {
    const report = await create.mutateAsync(input)
    toast.success("Rapport créé")
    router.push(`/reports/${report.id}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Nouveau rapport</h1>
      <ReportForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={create.isPending}
      />
    </div>
  )
}
