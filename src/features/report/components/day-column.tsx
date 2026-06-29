"use client"

import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useFieldArray, useFormContext } from "react-hook-form"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  WEEKDAY_LABELS,
  type ReportInput,
  type Weekday,
} from "../types/report.schema"
import { emptyActionBlock } from "../utils/report-factory"
import { DAY_DROP_PREFIX } from "../utils/dnd"
import { ActionBlockField } from "./action-block-field"
import { SortableBlock } from "./sortable-block"

export function DayColumn({
  dayIndex,
  day,
}: {
  dayIndex: number
  day: Weekday
}) {
  const { control } = useFormContext<ReportInput>()
  // keyName "fieldId" keeps our domain `id` intact on each field for DnD.
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${dayIndex}.blocks`,
    keyName: "fieldId",
  })

  const { setNodeRef, isOver } = useDroppable({
    id: `${DAY_DROP_PREFIX}${dayIndex}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 rounded-xl border p-4 transition-colors ${
        isOver ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{WEEKDAY_LABELS[day]}</h3>
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

      {fields.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-sm">
          Déposez un bloc ici ou ajoutez-en un.
        </p>
      ) : (
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {fields.map((field, blockIndex) => (
              <SortableBlock key={field.fieldId} id={field.id}>
                <ActionBlockField
                  dayIndex={dayIndex}
                  blockIndex={blockIndex}
                  onRemove={() => remove(blockIndex)}
                />
              </SortableBlock>
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}
