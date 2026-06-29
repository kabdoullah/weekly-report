import { getWeekInfo } from "@/lib/week"

import {
  WEEKDAYS,
  type ActionBlock,
  type DayActions,
  type ReportFormValues,
  type ReportInput,
} from "../types/report.schema"

let blockCounter = 0

/** Unique-enough id for a client-side action block (RHF field key, etc.). */
export function newBlockId(): string {
  blockCounter += 1
  return `block-${Date.now()}-${blockCounter}`
}

export function emptyActionBlock(
  defaults: Partial<Pick<ActionBlock, "project" | "module">> = {}
): ActionBlock {
  return {
    id: newBlockId(),
    project: defaults.project ?? "",
    module: defaults.module ?? "",
    tasks: [],
  }
}

/** Five empty days (Lundi–Vendredi) — backs "Préremplir la semaine". */
export function emptyWeekDays(): DayActions[] {
  return WEEKDAYS.map((day) => ({ day, blocks: [] }))
}

/**
 * A blank report pre-filled with the ISO week of `date`. Used when opening the
 * create screen so week/dates are computed up front.
 */
export function createEmptyReport(date: Date = new Date()): ReportInput {
  const week = getWeekInfo(date)
  return {
    meta: {
      name: "",
      department: "",
      mainProject: "",
      weekNumber: week.weekNumber,
      year: week.year,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
    },
    days: emptyWeekDays(),
    nonConformities: "",
    nextWeek: "",
  }
}

/**
 * Normalizes lenient form values into a strict `ReportInput`: trims and drops
 * empty task lines, and removes blocks that are entirely empty. Blocks left
 * partially filled (e.g. project but no module) are kept so the strict schema
 * surfaces the error on save.
 */
export function cleanReportFormValues(values: ReportFormValues): ReportInput {
  return {
    ...values,
    days: values.days.map((day) => ({
      ...day,
      blocks: day.blocks
        .map((block) => ({
          ...block,
          project: block.project.trim(),
          module: block.module.trim(),
          tasks: block.tasks.map((t) => t.trim()).filter(Boolean),
        }))
        .filter(
          (block) => block.project || block.module || block.tasks.length > 0
        ),
    })),
    nonConformities: values.nonConformities.trim(),
    nextWeek: values.nextWeek.trim(),
  }
}
