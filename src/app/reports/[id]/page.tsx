import { ReportEditView } from "@/features/report/components/report-edit-view"

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ReportEditView id={id} />
}
