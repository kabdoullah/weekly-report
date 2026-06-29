"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import {
  EyeIcon,
  FileIcon,
  FileType2Icon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { downloadReport } from "@/features/report/api"
import { useDeleteReport } from "@/features/report/hooks/use-reports"
import type { ReportSummary } from "@/features/report/types/report.schema"
import { formatWeekId, formatWeekTag } from "@/lib/week"

export function ReportListItem({ report }: { report: ReportSummary }) {
  const { meta } = report
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const remove = useDeleteReport()

  const weekId = formatWeekId(meta.year, meta.weekNumber)
  const updated = format(parseISO(report.updatedAt), "d MMM yyyy 'à' HH:mm", {
    locale: fr,
  })

  function handleDelete() {
    remove.mutate(report.id, {
      onSuccess: () => {
        toast.success("Rapport supprimé")
        setConfirmOpen(false)
      },
      onError: (e) => toast.error(e.message),
    })
  }

  return (
    <li className="group flex items-center gap-4 px-3 py-3 transition-colors hover:bg-accent/40 sm:px-4">
      {/* Index tab: every report filed under its ISO week. */}
      <Link
        href={`/reports/${report.id}`}
        aria-label={`Ouvrir le rapport ${weekId}`}
        className="flex shrink-0 flex-col items-center justify-center rounded-[4px] border border-border bg-background px-2.5 py-1.5 font-mono leading-tight tabular-nums transition-colors group-hover:border-signal/40"
      >
        <span className="text-[0.6rem] text-muted-foreground">{meta.year}</span>
        <span className="text-sm font-bold text-signal">
          {formatWeekTag(meta.weekNumber)}
        </span>
      </Link>

      <Link href={`/reports/${report.id}`} className="min-w-0 flex-1">
        <p className="truncate font-display font-medium">{meta.mainProject}</p>
        <p className="text-muted-foreground truncate font-mono text-xs">
          {meta.name} · maj {updated}
        </p>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ouvrir"
          nativeButton={false}
          render={<Link href={`/reports/${report.id}`} />}
        >
          <EyeIcon className="size-4" />
        </Button>

        <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Actions">
                  <MoreVerticalIcon className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => downloadReport(report.id, "pptx")}
              >
                <FileIcon className="size-4" />
                Télécharger PPTX
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Génération du PDF en cours…")
                  downloadReport(report.id, "pdf")
                }}
              >
                <FileType2Icon className="size-4" />
                Télécharger PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2Icon className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce rapport ?</DialogTitle>
            <DialogDescription>
              {weekId} — {meta.name}. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline">Annuler</Button>}
            />
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={handleDelete}
            >
              {remove.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}
