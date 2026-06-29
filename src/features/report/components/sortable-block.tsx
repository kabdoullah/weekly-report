"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Wraps an action block with sortable behavior. Only the grip handle carries the
 * drag listeners so the inputs inside the block stay fully usable.
 */
export function SortableBlock({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50" : undefined}
    >
      <div className="flex items-start gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Déplacer le bloc"
          className="mt-3 cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </Button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
