"use client"

import { Controller, useFormContext, useWatch } from "react-hook-form"
import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BlockTemplateMenu } from "@/features/templates/components/block-template-menu"

import type { ReportInput } from "../types/report.schema"
import { TasksField } from "./tasks-field"

/** Base path of a block, e.g. `days.0.blocks.2` or `nextWeek.1`. */
export type BlockPath =
  | `days.${number}.blocks.${number}`
  | `nextWeek.${number}`

interface ActionBlockFieldProps {
  name: BlockPath
  onRemove: () => void
}

export function ActionBlockField({ name: base, onRemove }: ActionBlockFieldProps) {
  const { control, register, setValue } = useFormContext<ReportInput>()

  const project = useWatch({ control, name: `${base}.project` })
  const moduleName = useWatch({ control, name: `${base}.module` })
  const tasks = useWatch({ control, name: `${base}.tasks` })

  return (
    <div className="bg-muted/40 space-y-3 rounded-lg border p-3">
      <div className="flex justify-end">
        <BlockTemplateMenu
          current={{ project, module: moduleName, tasks: tasks ?? [] }}
          onApply={(t) => {
            setValue(`${base}.project`, t.project, { shouldDirty: true })
            setValue(`${base}.module`, t.module, { shouldDirty: true })
            setValue(`${base}.tasks`, t.tasks, { shouldDirty: true })
          }}
        />
      </div>
      <div className="flex items-start gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Projet</Label>
            <Input placeholder="ex : CERFAM" {...register(`${base}.project`)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Module</Label>
            <Input placeholder="ex : LINKS" {...register(`${base}.module`)} />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Supprimer le bloc"
          className="mt-6"
          onClick={onRemove}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>

      <Controller
        control={control}
        name={`${base}.tasks`}
        render={({ field }) => (
          <TasksField
            value={field.value}
            onChange={field.onChange}
            project={project}
            module={moduleName}
          />
        )}
      />
    </div>
  )
}
