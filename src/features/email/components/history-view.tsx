"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { useEmailHistory, useResendEmail } from "../hooks/use-email-history"
import type {
  AttachmentChoice,
  EmailHistoryEntry,
  EmailStatus,
} from "../types/email-history.schema"

const STATUS_LABELS: Record<EmailStatus, string> = {
  sent: "Envoyé",
  failed: "Échec",
  draft: "Brouillon",
  scheduled: "Programmé",
}

const STATUS_VARIANTS: Record<
  EmailStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  sent: "default",
  failed: "destructive",
  draft: "secondary",
  scheduled: "outline",
}

const ATTACHMENT_LABELS: Record<AttachmentChoice, string> = {
  pptx: "PPTX",
  pdf: "PDF",
  both: "PPTX + PDF",
}

function formatDateTime(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: fr })
}

export function HistoryView() {
  const { data, isPending, isError, error } = useEmailHistory()

  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        {error?.message ?? "Le chargement de l'historique a échoué."}
      </p>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-card px-6 py-14 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Aucun envoi
        </p>
        <p className="text-sm text-muted-foreground">
          L&apos;historique des envois apparaîtra ici.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 font-medium">Destinataires</th>
            <th className="px-4 py-2 font-medium">Objet</th>
            <th className="px-4 py-2 font-medium">Statut</th>
            <th className="px-4 py-2 font-medium">Pièces jointes</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HistoryRow({ entry }: { entry: EmailHistoryEntry }) {
  const timestamp = entry.sentAt ?? entry.createdAt
  const resend = useResendEmail()

  async function handleResend() {
    try {
      await resend.mutateAsync(entry.id)
      toast.success("Rapport renvoyé")
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <tr>
      <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(timestamp)}</td>
      <td className="px-4 py-3">
        <span className="line-clamp-1">{entry.to.join(", ")}</span>
      </td>
      <td className="px-4 py-3">
        <span className="line-clamp-1">{entry.subject}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={STATUS_VARIANTS[entry.status]}>
          {STATUS_LABELS[entry.status]}
        </Badge>
        {entry.status === "failed" && entry.errorMessage && (
          <p className="mt-1 max-w-xs text-xs text-destructive">
            {entry.errorMessage}
          </p>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {ATTACHMENT_LABELS[entry.attachments]}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {entry.status === "failed" && (
          <Button
            variant="outline"
            size="sm"
            disabled={resend.isPending}
            onClick={handleResend}
          >
            Renvoyer
          </Button>
        )}
      </td>
    </tr>
  )
}
