import "server-only"

import { readFile } from "node:fs/promises"

import JSZip from "jszip"

import type { Report } from "@/features/report/types/report.schema"
import { formatWeekId, getNextWeekInfo } from "@/lib/week"

import {
  buildActions,
  buildNextWeek,
  buildNonConformities,
  buildTitle,
  buildWeekHeader,
} from "./build-txbody"
import { replaceShapeParagraphs } from "./inject"
import { SHAPE, SLIDE_ENTRY, TEMPLATE_PATH } from "./template"

export interface GeneratedPptx {
  buffer: Buffer
  filename: string
}

/** "2026-W17_week_Weekly Report_Abdoulaye COULIBALY.pptx" */
export function pptxFilename(report: Report): string {
  const { year, weekNumber, name } = report.meta
  return `${formatWeekId(year, weekNumber)}_week_Weekly Report_${name}.pptx`
}

/**
 * Renders a Report into a .pptx by rewriting the text bodies of the template's
 * shapes. The template's design (logo, banners, theme, fonts) is preserved
 * untouched. Server-only.
 */
export async function generatePptx(report: Report): Promise<GeneratedPptx> {
  const templateBytes = await readFile(TEMPLATE_PATH)
  const zip = await JSZip.loadAsync(templateBytes)

  const slideFile = zip.file(SLIDE_ENTRY)
  if (!slideFile) {
    throw new Error(`Template is missing ${SLIDE_ENTRY}`)
  }

  let slideXml = await slideFile.async("string")
  const { meta } = report
  const next = getNextWeekInfo(new Date(meta.weekStart))

  slideXml = replaceShapeParagraphs(
    slideXml,
    SHAPE.title,
    buildTitle(report)
  )
  slideXml = replaceShapeParagraphs(
    slideXml,
    SHAPE.headerLeft,
    buildWeekHeader(meta.weekStart, meta.weekEnd, "Semaine N")
  )
  slideXml = replaceShapeParagraphs(
    slideXml,
    SHAPE.headerRight,
    buildWeekHeader(next.weekStart, next.weekEnd, "Semaine N+1")
  )
  slideXml = replaceShapeParagraphs(
    slideXml,
    SHAPE.actions,
    buildActions(report.days)
  )
  slideXml = replaceShapeParagraphs(
    slideXml,
    SHAPE.nextWeek,
    buildNextWeek(report.nextWeek)
  )
  slideXml = replaceShapeParagraphs(
    slideXml,
    SHAPE.nonConformities,
    buildNonConformities(report.nonConformities)
  )

  zip.file(SLIDE_ENTRY, slideXml)

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  })

  return { buffer, filename: pptxFilename(report) }
}
