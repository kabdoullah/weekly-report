import {
  WEEKDAY_LABELS,
  type ActionBlock,
  type DayActions,
  type Report,
} from "@/features/report/types/report.schema"
import { formatDate, formatWeekRange } from "@/lib/week"

import { paragraph, run, type Fill, type RunStyle } from "./xml"

/**
 * Builds the paragraph XML for each dynamic shape of the template slide.
 * Styles below are extracted verbatim from the reference template so the output
 * matches it exactly. Each exported function returns the inner <a:p> sequence
 * to splice into a shape's <p:txBody> (see ./inject and ./generate).
 */

const WHITE: Fill = { kind: "scheme", val: "bg1" }
const BLACK: Fill = { kind: "srgb", hex: "000000" }
const ACCENT_WEEK: Fill = { kind: "scheme", val: "accent4" }
const TASK_MUTED: Fill = { kind: "scheme", val: "accent5", lumMod: 50000 }

const headerText: RunStyle = { sz: 1050, bold: true, fill: WHITE }
const weekLabel: RunStyle = { sz: 1050, bold: false, fill: ACCENT_WEEK }
const titleLabel: RunStyle = { sz: 1400, bold: true, fill: WHITE }
const titleValue: RunStyle = { sz: 1400, bold: false, fill: WHITE }
const blockHeader: RunStyle = { sz: 1000, bold: true, fill: BLACK }
const taskText: RunStyle = { sz: 1000, bold: false, fill: TASK_MUTED }
const nonConfText: RunStyle = { sz: 1050, bold: true, fill: BLACK }

const EMPTY_DAY = "Aucune tâche assignée sur la période."
const RAS = "RAS"

/** "Actions de la semaine du … au …" + colored "(Semaine N)" label. */
export function buildWeekHeader(
  weekStart: string,
  weekEnd: string,
  label: string
): string {
  const runs =
    run(`Actions de la semaine ${formatWeekRange(weekStart, weekEnd)}  `, headerText) +
    run(`(${label})`, weekLabel)
  return paragraph(runs)
}

/** Header block: Département / Intervenant(s) / Comité Direction. */
export function buildTitle(report: Report): string {
  const { department, name, weekEnd } = report.meta
  const line = (labelText: string, value: string) =>
    paragraph(run(labelText, titleLabel) + run(` : ${value}`, titleValue), {
      align: "l",
    })

  return (
    line("Département", department) +
    line("Intervenant(s)", name) +
    line("Comité Direction", formatDate(weekEnd))
  )
}

/** Left column: the week's action blocks grouped by day. */
export function buildActions(days: DayActions[]): string {
  const paragraphs: string[] = []

  for (const { day, blocks } of days) {
    if (blocks.length === 0) continue
    const dayLabel = WEEKDAY_LABELS[day]
    for (const block of blocks) {
      paragraphs.push(...renderBlock(block, ` - ${dayLabel}`))
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      paragraph(run(EMPTY_DAY, taskText), { bullet: "dot", indented: true })
    )
  }

  return paragraphs.join("")
}

/** One block: a bold "[Projet][Module]<suffix>" header + its task bullets. */
function renderBlock(block: ActionBlock, headerSuffix: string): string[] {
  const out = [
    paragraph(
      run(`[${block.project}][${block.module}]${headerSuffix}`, blockHeader),
      { bullet: "square", indented: true }
    ),
  ]
  const tasks = block.tasks.length > 0 ? block.tasks : [EMPTY_DAY]
  for (const task of tasks) {
    out.push(paragraph(run(task, taskText), { bullet: "dot", indented: true }))
  }
  return out
}

/** Right column: next-week forecast, same block format as actions (no day). */
export function buildNextWeek(blocks: ActionBlock[]): string {
  if (blocks.length === 0) return paragraph("")
  return blocks.flatMap((block) => renderBlock(block, "")).join("")
}

/** Non-conformities free text, one bullet per line ("RAS" when empty). */
export function buildNonConformities(text: string): string {
  return buildBulletedText(text, nonConfText)
}

function buildBulletedText(text: string, style: RunStyle): string {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const items = lines.length > 0 ? lines : [RAS]
  return items
    .map((line) => paragraph(run(line, style), { bullet: "square", indented: true }))
    .join("")
}
