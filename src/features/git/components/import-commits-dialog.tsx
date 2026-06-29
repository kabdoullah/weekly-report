"use client"

import * as React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { GitCommitHorizontalIcon, WandSparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRephrase } from "@/features/ai/hooks/use-rephrase"
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  type ReportInput,
} from "@/features/report/types/report.schema"
import { emptyActionBlock } from "@/features/report/utils/report-factory"

import { useGitCommits } from "../hooks/use-git-commits"

export function ImportCommitsDialog() {
  const { control, getValues, reset } = useFormContext<ReportInput>()
  const weekStart = useWatch({ control, name: "meta.weekStart" })
  const weekEnd = useWatch({ control, name: "meta.weekEnd" })

  const commitsQuery = useGitCommits()
  const rephrase = useRephrase()

  const [open, setOpen] = React.useState(false)
  const [repoPath, setRepoPath] = React.useState("")
  const [author, setAuthor] = React.useState("")
  const [commits, setCommits] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const [targetDay, setTargetDay] = React.useState<string>(WEEKDAYS[0])

  async function load() {
    if (!repoPath.trim()) return
    try {
      const result = await commitsQuery.mutateAsync({
        repoPath: repoPath.trim(),
        since: weekStart,
        until: weekEnd,
        author: author.trim() || undefined,
      })
      setCommits(result)
      setSelected(new Set(result.map((_, i) => i)))
      if (result.length === 0) toast.info("Aucun commit sur la période")
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  function toggle(index: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const selectedTexts = () =>
    commits.filter((_, i) => selected.has(i)).map((c) => c.trim())

  async function rephraseSelected() {
    const items = selectedTexts()
    if (items.length === 0) return
    try {
      const results = await rephrase.mutateAsync({
        items: items.map((text) => ({ text })),
      })
      // Replace selected commit texts in-place with their rewrites.
      const indices = [...selected].sort((a, b) => a - b)
      setCommits((prev) => {
        const next = [...prev]
        indices.forEach((idx, i) => {
          if (results[i]) next[idx] = results[i]
        })
        return next
      })
      toast.success("Commits reformulés")
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  function insert() {
    const tasks = selectedTexts()
    if (tasks.length === 0) return
    const dayIndex = WEEKDAYS.indexOf(targetDay as (typeof WEEKDAYS)[number])
    const days = getValues("days")
    const next = days.map((day, i) =>
      i === dayIndex
        ? { ...day, blocks: [...day.blocks, { ...emptyActionBlock(), tasks }] }
        : day
    )
    reset({ ...getValues(), days: next })
    toast.success(`${tasks.length} tâche(s) ajoutée(s) à ${WEEKDAY_LABELS[targetDay as keyof typeof WEEKDAY_LABELS]}`)
    setOpen(false)
    setCommits([])
    setSelected(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <GitCommitHorizontalIcon className="size-4" />
            Importer des commits Git
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer des commits Git</DialogTitle>
          <DialogDescription>
            Lit `git log` du dépôt sur la période de la semaine
            ({weekStart} → {weekEnd}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="repo-path">Chemin local du dépôt</Label>
            <Input
              id="repo-path"
              placeholder="/home/moi/projets/links"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Chemin du dépôt cloné sur la machine — pas une URL GitLab.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="git-author">Auteur (optionnel)</Label>
            <Input
              id="git-author"
              placeholder="moi@mail.com"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={!repoPath.trim() || commitsQuery.isPending}
          onClick={load}
        >
          {commitsQuery.isPending ? "Chargement…" : "Charger les commits"}
        </Button>

        {commits.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selected.size}/{commits.length} sélectionné(s)
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={rephrase.isPending || selected.size === 0}
                onClick={rephraseSelected}
              >
                <WandSparklesIcon className="size-3.5" />
                Reformuler la sélection
              </Button>
            </div>
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
              {commits.map((commit, i) => (
                <li key={i}>
                  <label className="hover:bg-muted flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggle(i)}
                      className="mt-0.5"
                    />
                    <span>{commit}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="sm:items-end">
          {commits.length > 0 && (
            <div className="mr-auto space-y-1.5">
              <Label>Ajouter au jour</Label>
              <Select
                value={targetDay}
                onValueChange={(v) => v && setTargetDay(v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {WEEKDAY_LABELS[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="button"
            disabled={selected.size === 0}
            onClick={insert}
          >
            Insérer comme bloc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
