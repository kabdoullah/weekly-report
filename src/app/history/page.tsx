import { HistoryView } from "@/features/email/components/history-view"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          Envoi du rapport
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Historique des envois
        </h1>
      </div>
      <HistoryView />
    </div>
  )
}
