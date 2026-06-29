"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarDaysIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatWeekRange, getWeekInfo } from "@/lib/week"

export function WeekInfoCard() {
  // Computed on the client so it always reflects "today".
  const week = React.useMemo(() => getWeekInfo(), [])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDaysIcon className="size-6" />
          </div>
          <div>
            <p className="text-2xl font-semibold">Semaine {week.weekNumber}</p>
            <p className="text-muted-foreground text-sm capitalize">
              {formatWeekRange(week.weekStart, week.weekEnd)}
            </p>
          </div>
        </div>
        <Button nativeButton={false} render={<Link href="/reports/new" />}>
          <PlusIcon className="size-4" />
          Nouveau rapport
        </Button>
      </CardContent>
    </Card>
  )
}
