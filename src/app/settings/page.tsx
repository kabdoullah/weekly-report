import { SettingsView } from "@/features/email/components/settings-view"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b border-border pb-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          Configuration
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Paramètres
        </h1>
      </div>
      <SettingsView />
    </div>
  )
}
