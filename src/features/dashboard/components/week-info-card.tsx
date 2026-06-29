"use client"

import * as React from "react"
import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatDate, formatWeekTag, getWeekInfo } from "@/lib/week"

import { WeekdayRail } from "./weekday-rail"

export function WeekInfoCard() {
  // Computed on the client so it always reflects "today".
  const week = React.useMemo(() => getWeekInfo(), [])
  // ISO Mon..Fri -> 0..4; weekend -> none lit.
  const today = React.useMemo(() => {
    const d = new Date().getDay() // 0 Sun .. 6 Sat
    return d >= 1 && d <= 5 ? d - 1 : -1
  }, [])

  return (
    <section className="relative overflow-hidden rounded-md border border-border bg-card ring-1 ring-foreground/[0.03]">
      <div className="absolute inset-y-0 left-0 w-1 bg-signal" aria-hidden />
      <div className="flex flex-col gap-6 px-6 py-6 pl-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Semaine courante · {week.year}
          </p>
          <div className="flex items-end gap-4">
            <span className="font-display text-6xl font-semibold leading-none tracking-tight tabular-nums">
              {formatWeekTag(week.weekNumber)}
            </span>
            <span className="mb-1.5 font-mono text-sm text-muted-foreground">
              {formatDate(week.weekStart)}
              <span className="px-1.5 text-signal">→</span>
              {formatDate(week.weekEnd)}
            </span>
          </div>
          <WeekdayRail active={today} size="lg" />
        </div>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/reports/new" />}
          className="shrink-0"
        >
          <PlusIcon className="size-4" />
          Nouveau rapport
        </Button>
      </div>
    </section>
  )
}
