"use client"

import * as React from "react"
import { PlusIcon, SparklesIcon, Trash2Icon, WandSparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRephrase } from "@/features/ai/hooks/use-rephrase"

interface TasksFieldProps {
  value: string[]
  onChange: (tasks: string[]) => void
  /** Context passed to the AI for sharper rewrites. */
  project?: string
  module?: string
}

export function TasksField({ value, onChange, project, module }: TasksFieldProps) {
  const rephrase = useRephrase()
  const [busyIndex, setBusyIndex] = React.useState<number | null>(null)

  const setTask = (index: number, text: string) =>
    onChange(value.map((t, i) => (i === index ? text : t)))
  const addTask = () => onChange([...value, ""])
  const removeTask = (index: number) =>
    onChange(value.filter((_, i) => i !== index))

  async function rephraseOne(index: number) {
    const text = value[index]?.trim()
    if (!text) return
    setBusyIndex(index)
    try {
      const [result] = await rephrase.mutateAsync({
        items: [{ text, project, module }],
      })
      if (result) setTask(index, result)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusyIndex(null)
    }
  }

  async function rephraseAll() {
    const items = value
      .map((text, index) => ({ index, text: text.trim() }))
      .filter((x) => x.text.length > 0)
    if (items.length === 0) return
    try {
      const results = await rephrase.mutateAsync({
        items: items.map((x) => ({ text: x.text, project, module })),
      })
      const next = [...value]
      items.forEach((x, i) => {
        if (results[i]) next[x.index] = results[i]
      })
      onChange(next)
      toast.success("Tâches reformulées")
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">Tâches</span>
        {value.some((t) => t.trim()) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={rephrase.isPending}
            onClick={rephraseAll}
          >
            <WandSparklesIcon className="size-3.5" />
            Reformuler tout
          </Button>
        )}
      </div>

      {value.map((task, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={task}
            placeholder="ex : ajout permissions backend"
            onChange={(e) => setTask(index, e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reformuler avec l'IA"
            disabled={!task.trim() || busyIndex === index}
            onClick={() => rephraseOne(index)}
          >
            <SparklesIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Supprimer la tâche"
            onClick={() => removeTask(index)}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addTask}>
        <PlusIcon className="size-4" />
        Ajouter une tâche
      </Button>
    </div>
  )
}
