"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ReportInput } from "../types/report.schema"
import { emptyActionBlock } from "../utils/report-factory"
import { ActionBlockField } from "./action-block-field"

/**
 * Next-week forecast: a flat list of [Projet][Module] blocks (no day split).
 * Optional — leave empty when next week's tasks aren't known yet.
 */
export function NextWeekField() {
  const { control } = useFormContext<ReportInput>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nextWeek",
    keyName: "fieldId",
  })

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-sm">
          Aucune prévision. Ajoutez un bloc si vous connaissez déjà des tâches.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <ActionBlockField
              key={field.fieldId}
              name={`nextWeek.${index}`}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(emptyActionBlock())}
      >
        <PlusIcon className="size-4" />
        Ajouter un bloc
      </Button>
    </div>
  )
}
