"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { CalendarDaysIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatWeekRange, getWeekInfo } from "@/lib/week"

import type { ReportInput } from "../types/report.schema"

export function GeneralInfoFields() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<ReportInput>()

  const weekNumber = useWatch({ control, name: "meta.weekNumber" })
  const weekStart = useWatch({ control, name: "meta.weekStart" })
  const weekEnd = useWatch({ control, name: "meta.weekEnd" })

  function prefillCurrentWeek() {
    const week = getWeekInfo()
    setValue("meta.weekNumber", week.weekNumber, { shouldDirty: true })
    setValue("meta.year", week.year, { shouldDirty: true })
    setValue("meta.weekStart", week.weekStart, { shouldDirty: true })
    setValue("meta.weekEnd", week.weekEnd, { shouldDirty: true })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Nom" error={errors.meta?.name?.message}>
          <Input placeholder="Abdoulaye COULIBALY" {...register("meta.name")} />
        </Field>
        <Field label="Département" error={errors.meta?.department?.message}>
          <Input placeholder="Développement" {...register("meta.department")} />
        </Field>
        <Field label="Projet principal" error={errors.meta?.mainProject?.message}>
          <Input placeholder="CERFAM" {...register("meta.mainProject")} />
        </Field>
      </div>

      <div className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="text-muted-foreground size-5" />
          <div>
            <p className="font-medium">Semaine {weekNumber}</p>
            <p className="text-muted-foreground text-sm capitalize">
              {formatWeekRange(weekStart, weekEnd)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={prefillCurrentWeek}
        >
          <RefreshCwIcon className="size-4" />
          Préremplir la semaine
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
