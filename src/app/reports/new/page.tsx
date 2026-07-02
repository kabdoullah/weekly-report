import { redirect } from "next/navigation"

import { ReportCreateView } from "@/features/report/components/report-create-view"
import { findUserById, getSession } from "@/services/auth"

export default async function NewReportPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const user = await findUserById(session.userId)
  if (!user) redirect("/login")

  return <ReportCreateView accountName={user.name} />
}
