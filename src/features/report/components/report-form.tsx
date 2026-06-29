"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import {
  reportFormSchema,
  reportInputSchema,
  type ReportFormValues,
  type ReportInput,
} from "../types/report.schema"
import { ImportCommitsDialog } from "@/features/git/components/import-commits-dialog"

import { cleanReportFormValues } from "../utils/report-factory"
import { DayActionsBoard } from "./day-actions-board"
import { GeneralInfoFields } from "./general-info-fields"
import { NextWeekField } from "./next-week-field"

// Defaults may omit fields that have Zod defaults (input type); the resolver
// fills them so the submit handler receives the complete output type.
type FormInput = z.input<typeof reportFormSchema>

interface ReportFormProps {
  defaultValues: ReportFormValues
  onSubmit: (input: ReportInput) => Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
}

export function ReportForm({
  defaultValues,
  onSubmit,
  submitLabel = "Générer le rapport",
  isSubmitting,
}: ReportFormProps) {
  const form = useForm<FormInput, unknown, ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues,
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    const cleaned = cleanReportFormValues(values)
    const parsed = reportInputSchema.safeParse(cleaned)
    if (!parsed.success) {
      toast.error("Vérifiez les blocs : projet et module sont requis.")
      return
    }
    await onSubmit(parsed.data)
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Section title="Informations générales">
          <GeneralInfoFields />
        </Section>

        <Separator />

        <Section title="Actions de la semaine">
          <div className="flex justify-end">
            <ImportCommitsDialog />
          </div>
          <DayActionsBoard />
        </Section>

        <Separator />

        <Section title="Non-conformités">
          <Textarea
            rows={4}
            placeholder={"APIs indisponibles\nAttente validation backend\nInternet instable"}
            {...form.register("nonConformities")}
          />
          <p className="text-muted-foreground text-xs">
            Une ligne par point. Laissé vide, affiche « RAS ».
          </p>
        </Section>

        <Section title="Prévisions semaine prochaine">
          <NextWeekField />
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement…" : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <Label className="text-base font-semibold">{title}</Label>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
