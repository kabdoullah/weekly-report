"use client"

import * as React from "react"

import { MailIcon } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import type { Report } from "@/features/report/types/report.schema"
import { buildDefaultBody, buildDefaultSubject } from "@/services/mail/template"

import { useEmailSettings } from "../hooks/use-email-settings"
import {
  useDraftReportEmail,
  useScheduleReportEmail,
  useSendReportEmail,
} from "../hooks/use-send-email"
import type { AttachmentChoice } from "../types/email-history.schema"
import { joinRecipientsList, parseRecipientsList } from "../types/email-settings.schema"

const ATTACHMENT_LABELS: Record<AttachmentChoice, string> = {
  pptx: "PPTX",
  pdf: "PDF",
  both: "PPTX + PDF",
}

export function SendReportDialog({ report }: { report: Report }) {
  const [open, setOpen] = React.useState(false)
  const settings = useEmailSettings()
  const send = useSendReportEmail()
  const draft = useDraftReportEmail()
  const schedule = useScheduleReportEmail()

  const [to, setTo] = React.useState("")
  const [cc, setCc] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [attachments, setAttachments] = React.useState<AttachmentChoice>("both")
  const [scheduledForLocal, setScheduledForLocal] = React.useState("")
  const prefilled = React.useRef(false)
  const isPending = send.isPending || draft.isPending || schedule.isPending

  // Prefill from settings the first time they load while the dialog is open.
  React.useEffect(() => {
    if (!open || prefilled.current || !settings.data) return
    prefilled.current = true
    setTo(joinRecipientsList(settings.data.primaryRecipients))
    setCc(joinRecipientsList(settings.data.ccRecipients))
    setSubject(settings.data.defaultSubject || buildDefaultSubject(report.meta))
    setBody(buildDefaultBody(report.meta.name, settings.data.defaultBody || undefined))
  }, [open, settings.data, report.meta])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) prefilled.current = false
  }

  function buildInput() {
    return {
      reportId: report.id,
      subject,
      body,
      to: parseRecipientsList(to),
      cc: parseRecipientsList(cc),
      attachments,
    }
  }

  async function handleSend() {
    try {
      await send.mutateAsync(buildInput())
      toast.success("Rapport envoyé par email")
      setOpen(false)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleDraft() {
    try {
      await draft.mutateAsync(buildInput())
      toast.success("Brouillon enregistré dans Outlook")
      setOpen(false)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleSchedule() {
    if (!scheduledForLocal) {
      toast.error("Choisissez une date et une heure d'envoi")
      return
    }
    const scheduledFor = new Date(scheduledForLocal).toISOString()
    try {
      await schedule.mutateAsync({ ...buildInput(), scheduledFor })
      toast.success("Envoi programmé")
      setOpen(false)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <MailIcon className="size-4" />
            Envoyer le rapport
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Envoyer le rapport par email</DialogTitle>
          <DialogDescription>
            {settings.data && !settings.data.connected
              ? "Aucun compte Outlook connecté — rendez-vous dans Paramètres."
              : "Vérifiez les destinataires et le contenu avant l'envoi."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="send-to">Destinataires</Label>
            <Textarea
              id="send-to"
              rows={2}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-cc">CC</Label>
            <Textarea
              id="send-cc"
              rows={2}
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-subject">Objet</Label>
            <Input
              id="send-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-body">Corps</Label>
            <Textarea
              id="send-body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Pièce jointe</Label>
            <Select
              value={attachments}
              onValueChange={(v) => v && setAttachments(v as AttachmentChoice)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ATTACHMENT_LABELS) as AttachmentChoice[]).map(
                  (choice) => (
                    <SelectItem key={choice} value={choice}>
                      {ATTACHMENT_LABELS[choice]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-schedule">Programmer pour (optionnel)</Label>
            <Input
              id="send-schedule"
              type="datetime-local"
              value={scheduledForLocal}
              onChange={(e) => setScheduledForLocal(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleDraft}
          >
            Enregistrer comme brouillon
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleSchedule}
          >
            Programmer l&apos;envoi
          </Button>
          <Button type="button" disabled={isPending} onClick={handleSend}>
            Envoyer maintenant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
