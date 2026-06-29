"use client"

import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useReports } from "@/features/report/hooks/use-reports"

import { ReportListItem } from "./report-list-item"

export function ReportList() {
  const { data, isPending, isError, error } = useReports()

  if (isPending) {
    return (
      <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-11 w-12 rounded-[4px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-6 text-sm text-destructive">
        Le chargement a échoué : {error.message}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border bg-card px-6 py-14 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Carnet vide
        </p>
        <div className="space-y-1">
          <p className="font-display text-lg font-medium">
            Aucune semaine archivée
          </p>
          <p className="text-sm text-muted-foreground">
            Démarrez le rapport de cette semaine pour ouvrir le carnet.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/reports/new" />}>
          <PlusIcon className="size-4" />
          Nouveau rapport
        </Button>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
      {data.map((report) => (
        <ReportListItem key={report.id} report={report} />
      ))}
    </ul>
  )
}
