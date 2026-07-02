"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { downloadReport } from "@/features/report/api"
import { useProfileStore } from "@/features/profile/store"
import { SendReportDialog } from "@/features/email/components/send-report-dialog"
import { FileIcon, FileType2Icon } from "lucide-react"

import { useReport, useUpdateReport } from "../hooks/use-reports"
import type { ReportFormValues, ReportInput } from "../types/report.schema"
import { ReportForm } from "./report-form"

export function ReportEditView({ id }: { id: string }) {
  const router = useRouter()
  const { data, isPending, isError, error } = useReport(id)
  const update = useUpdateReport(id)
  const setProfile = useProfileStore((s) => s.setProfile)

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-destructive text-sm">
        {error?.message ?? "Rapport introuvable."}
      </p>
    )
  }

  const defaultValues: ReportFormValues = {
    meta: data.meta,
    days: data.days,
    nonConformities: data.nonConformities,
    nextWeek: data.nextWeek,
  }

  async function handleSubmit(input: ReportInput) {
    setProfile(input.meta)
    await update.mutateAsync(input)
    toast.success("Rapport mis à jour")
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <div className="space-y-1">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            Édition
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Modifier le rapport
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport(id, "pptx")}
          >
            <FileIcon className="size-4" />
            PPTX
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Génération du PDF en cours…")
              downloadReport(id, "pdf")
            }}
          >
            <FileType2Icon className="size-4" />
            PDF
          </Button>
          <SendReportDialog report={data} />
        </div>
      </div>

      <ReportForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Enregistrer les modifications"
        isSubmitting={update.isPending}
      />
    </div>
  )
}
