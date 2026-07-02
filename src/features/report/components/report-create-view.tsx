"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Skeleton } from "@/components/ui/skeleton"
import { useProfileStore } from "@/features/profile/store"

import { useCreateReport } from "../hooks/use-reports"
import type { ReportInput } from "../types/report.schema"
import { createEmptyReport } from "../utils/report-factory"
import { ReportForm } from "./report-form"

const emptySubscribe = () => () => {}

export function ReportCreateView({ accountName }: { accountName: string }) {
  const router = useRouter()
  const create = useCreateReport()

  const { department, mainProject, setProfile } = useProfileStore()

  // Profile lives in localStorage (client-only). Render after mount so the
  // pre-filled inputs don't trigger a hydration mismatch.
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const defaultValues = React.useMemo(() => {
    const base = createEmptyReport()
    return {
      ...base,
      meta: { ...base.meta, name: accountName, department, mainProject },
    }
  }, [accountName, department, mainProject])

  async function handleSubmit(input: ReportInput) {
    setProfile(input.meta)
    const report = await create.mutateAsync(input)
    toast.success("Rapport créé")
    router.push(`/reports/${report.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          Nouvelle entrée
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Nouveau rapport
        </h1>
      </div>
      {mounted ? (
        <ReportForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      ) : (
        <Skeleton className="h-96 w-full" />
      )}
    </div>
  )
}
