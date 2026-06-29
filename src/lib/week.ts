import {
  addDays,
  addWeeks,
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  startOfISOWeek,
} from "date-fns"
import { fr } from "date-fns/locale"

/**
 * ISO week arithmetic. Monday-based, matching the PowerPoint template.
 * Never hand-roll week math elsewhere — use these helpers.
 */

export interface WeekInfo {
  /** ISO week number, 1–53. */
  weekNumber: number
  /** ISO week-numbering year (can differ from calendar year at edges). */
  year: number
  /** Monday, ISO date string (yyyy-MM-dd). */
  weekStart: string
  /** Friday, ISO date string (yyyy-MM-dd). */
  weekEnd: string
}

const ISO_DATE = "yyyy-MM-dd"

/** Build WeekInfo (Mon–Fri) for the ISO week containing `date`. */
export function getWeekInfo(date: Date = new Date()): WeekInfo {
  const monday = startOfISOWeek(date)
  const friday = addDays(monday, 4)

  return {
    weekNumber: getISOWeek(date),
    year: getISOWeekYear(date),
    weekStart: format(monday, ISO_DATE),
    weekEnd: format(friday, ISO_DATE),
  }
}

/** WeekInfo for the week after the one containing `date` (forecast block). */
export function getNextWeekInfo(date: Date = new Date()): WeekInfo {
  return getWeekInfo(addWeeks(startOfISOWeek(date), 1))
}

/** The five working-day Dates (Mon–Fri) for a week's Monday ISO string. */
export function workingDaysOf(weekStart: string): Date[] {
  const monday = parseISO(weekStart)
  return Array.from({ length: 5 }, (_, i) => addDays(monday, i))
}

/** "WXX" zero-padded, e.g. 17 -> "W17". */
export function formatWeekTag(weekNumber: number): string {
  return `W${String(weekNumber).padStart(2, "0")}`
}

/** "YYYY-WXX", e.g. "2026-W17". */
export function formatWeekId(year: number, weekNumber: number): string {
  return `${year}-${formatWeekTag(weekNumber)}`
}

/** Display a date as "DD/MM/YYYY". */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "dd/MM/yyyy", { locale: fr })
}

/** "du DD/MM/YYYY au DD/MM/YYYY", as printed in the slide header. */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  return `du ${formatDate(weekStart)} au ${formatDate(weekEnd)}`
}
