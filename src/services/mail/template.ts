import type { ReportMeta } from "@/features/report/types/report.schema"
import { formatWeekId } from "@/lib/week"

/** Default body template (French), `{{nom}}` substituted at send time. */
export const DEFAULT_BODY_TEMPLATE = `Bonjour,

Veuillez trouver en pièce jointe mon rapport d'activités hebdomadaire.

Bonne réception.

Cordialement,

{{nom}}`

/** "{{année}}-W{{semaine}}_Weekly Report_{{nom}}" — intentionally no `_week_`
 * infix, unlike the PPTX filename convention. */
export function buildDefaultSubject(
  meta: Pick<ReportMeta, "year" | "weekNumber" | "name">
): string {
  return `${formatWeekId(meta.year, meta.weekNumber)}_Weekly Report_${meta.name}`
}

export function buildDefaultBody(
  name: string,
  template: string = DEFAULT_BODY_TEMPLATE
): string {
  return template.replaceAll("{{nom}}", name)
}
