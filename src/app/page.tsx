import { ReportList } from "@/features/dashboard/components/report-list"
import { WeekInfoCard } from "@/features/dashboard/components/week-info-card"

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <WeekInfoCard />

      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <h2 className="font-display text-base font-semibold tracking-tight">
            Semaines archivées
          </h2>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
            Historique
          </span>
        </div>
        <ReportList />
      </section>
    </div>
  )
}
