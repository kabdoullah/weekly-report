"use client"

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { useFormContext } from "react-hook-form"

import { WEEKDAYS, type ReportInput } from "../types/report.schema"
import { relocateBlock } from "../utils/dnd"
import { DayColumn } from "./day-column"

export function DayActionsBoard() {
  const { getValues, reset } = useFormContext<ReportInput>()

  // Small distance threshold so clicks on the grip don't block normal input use.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return
    const next = relocateBlock(
      getValues("days"),
      String(active.id),
      String(over.id)
    )
    // reset (rather than setValue) reliably rebuilds the nested field arrays.
    if (next) reset({ ...getValues(), days: next })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {WEEKDAYS.map((day, index) => (
          <DayColumn key={day} day={day} dayIndex={index} />
        ))}
      </div>
    </DndContext>
  )
}
