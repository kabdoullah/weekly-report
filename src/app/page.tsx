import { ReportList } from "@/features/dashboard/components/report-list"
import { WeekInfoCard } from "@/features/dashboard/components/week-info-card"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <WeekInfoCard />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Rapports générés</h2>
        <ReportList />
      </section>
    </div>
  )
}
