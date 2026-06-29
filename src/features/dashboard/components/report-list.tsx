"use client"

import Link from "next/link"
import { FileBarChart2Icon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useReports } from "@/features/report/hooks/use-reports"

import { ReportListItem } from "./report-list-item"

export function ReportList() {
  const { data, isPending, isError, error } = useReports()

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-17 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="text-destructive py-6 text-sm">
          Erreur de chargement : {error.message}
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <FileBarChart2Icon className="size-6" />
          </div>
          <div>
            <p className="font-medium">Aucun rapport pour le moment</p>
            <p className="text-muted-foreground text-sm">
              Créez votre premier rapport hebdomadaire.
            </p>
          </div>
          <Button render={<Link href="/reports/new" />}>
            <PlusIcon className="size-4" />
            Nouveau rapport
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((report) => (
        <ReportListItem key={report.id} report={report} />
      ))}
    </div>
  )
}
