import { z } from "zod"

/**
 * The report JSON shape is the single source of truth for the whole app.
 * Define it once here as Zod schemas and derive TypeScript types from them —
 * never hand-write a parallel `interface`.
 */

/** Working days covered by a weekly report, in display order. */
export const WEEKDAYS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
] as const

export const weekdaySchema = z.enum(WEEKDAYS)
export type Weekday = z.infer<typeof weekdaySchema>

/** Human label for a weekday, e.g. "lundi" -> "Lundi". */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
}

/** One [PROJET][MODULE] action block within a day. */
export const actionBlockSchema = z.object({
  id: z.string().min(1),
  project: z.string().trim().min(1, "Projet requis"),
  module: z.string().trim().min(1, "Module requis"),
  /** Raw or AI-rephrased task lines, one sentence each. */
  tasks: z.array(z.string().trim().min(1)).default([]),
})
export type ActionBlock = z.infer<typeof actionBlockSchema>

/** A single day with zero or more action blocks. */
export const dayActionsSchema = z.object({
  day: weekdaySchema,
  blocks: z.array(actionBlockSchema).default([]),
})
export type DayActions = z.infer<typeof dayActionsSchema>

/** General info shown in the slide header. */
export const reportMetaSchema = z.object({
  /** Full name, e.g. "Abdoulaye COULIBALY". */
  name: z.string().trim().min(1, "Nom requis"),
  department: z.string().trim().min(1, "Département requis"),
  /** Main project, e.g. "CERFAM". */
  mainProject: z.string().trim().min(1, "Projet principal requis"),
  /** ISO week number (1–53). */
  weekNumber: z.number().int().min(1).max(53),
  /** ISO week-numbering year (may differ from calendar year at edges). */
  year: z.number().int(),
  /** Monday and Friday of the report week, ISO date strings (yyyy-MM-dd). */
  weekStart: z.iso.date(),
  weekEnd: z.iso.date(),
})
export type ReportMeta = z.infer<typeof reportMetaSchema>

/** A complete weekly report, as persisted to JSON. */
export const reportSchema = z.object({
  id: z.string().min(1),
  meta: reportMetaSchema,
  days: z.array(dayActionsSchema),
  /** Free text; rendered as "RAS" when empty. */
  nonConformities: z.string().default(""),
  /**
   * Forecast for next week, same block structure as a day's actions (no day
   * split). `preprocess` migrates legacy reports where this was free text.
   */
  nextWeek: z.preprocess(
    (v) => (typeof v === "string" ? [] : (v ?? [])),
    z.array(actionBlockSchema)
  ),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
export type Report = z.infer<typeof reportSchema>

/** Payload accepted by create/update — server fills id/timestamps. */
export const reportInputSchema = reportSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type ReportInput = z.infer<typeof reportInputSchema>

/** Lightweight row for the dashboard history list. */
export const reportSummarySchema = reportSchema.pick({
  id: true,
  meta: true,
  updatedAt: true,
})
export type ReportSummary = z.infer<typeof reportSummarySchema>

/**
 * Lenient schema for the editing form: a block being filled in may have blank
 * project/module and empty task inputs. Meta stays strict so the required
 * identity fields get inline errors. Clean to a strict `ReportInput` with
 * `cleanReportFormValues` before persisting.
 */
const formBlockSchema = actionBlockSchema.extend({
  project: z.string().default(""),
  module: z.string().default(""),
  tasks: z.array(z.string()).default([]),
})

export const reportFormSchema = reportInputSchema.extend({
  days: z.array(
    dayActionsSchema.extend({ blocks: z.array(formBlockSchema) })
  ),
  nextWeek: z.array(formBlockSchema),
})
export type ReportFormValues = z.infer<typeof reportFormSchema>
