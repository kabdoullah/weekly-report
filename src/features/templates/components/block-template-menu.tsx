"use client"

import * as React from "react"
import { BookmarkIcon, BookmarkPlusIcon, LayersIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useTemplateStore } from "../store"
import type { Template } from "../types"

interface BlockTemplateMenuProps {
  current: { project: string; module: string; tasks: string[] }
  onApply: (template: Template) => void
}

export function BlockTemplateMenu({ current, onApply }: BlockTemplateMenuProps) {
  const templates = useTemplateStore((s) => s.templates)
  const addTemplate = useTemplateStore((s) => s.addTemplate)
  const removeTemplate = useTemplateStore((s) => s.removeTemplate)

  const [saveOpen, setSaveOpen] = React.useState(false)
  const [name, setName] = React.useState("")

  const canSave = current.project.trim() && current.module.trim()

  function handleSave() {
    if (!canSave || !name.trim()) return
    addTemplate({
      name: name.trim(),
      project: current.project.trim(),
      module: current.module.trim(),
      tasks: current.tasks.filter((t) => t.trim()),
    })
    toast.success("Modèle enregistré")
    setName("")
    setSaveOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="ghost" size="sm">
              <LayersIcon className="size-3.5" />
              Modèles
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Appliquer un modèle</DropdownMenuLabel>
          {templates.length === 0 ? (
            <DropdownMenuItem disabled>Aucun modèle</DropdownMenuItem>
          ) : (
            templates.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onApply(t)}
                className="justify-between"
              >
                <span className="flex items-center gap-2 truncate">
                  <BookmarkIcon className="size-3.5 shrink-0" />
                  {t.name}
                </span>
                <Trash2Icon
                  className="text-muted-foreground hover:text-destructive size-3.5 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTemplate(t.id)
                  }}
                />
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!canSave}
            onClick={() => setSaveOpen(true)}
          >
            <BookmarkPlusIcon className="size-3.5" />
            Enregistrer ce bloc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer comme modèle</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="template-name">Nom du modèle</Label>
            <Input
              id="template-name"
              value={name}
              placeholder="ex : CERFAM · LINKS"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <p className="text-muted-foreground text-xs">
              {current.project || "—"} · {current.module || "—"}
            </p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Annuler</Button>} />
            <Button onClick={handleSave} disabled={!name.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
