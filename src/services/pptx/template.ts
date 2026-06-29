import path from "node:path"

/** Absolute path to the committed .pptx template asset. */
export const TEMPLATE_PATH = path.join(
  process.cwd(),
  "templates",
  "weekly-report.pptx"
)

/** The slide whose shapes we rewrite (template has a single slide). */
export const SLIDE_ENTRY = "ppt/slides/slide1.xml"

/**
 * Shape names as found in the template's slide1.xml. Targeting by name keeps the
 * mapping explicit and resilient to shape reordering.
 */
export const SHAPE = {
  headerLeft: "ZoneTexte 5",
  headerRight: "ZoneTexte 7",
  actions: "ZoneTexte 9",
  nextWeek: "ZoneTexte 10",
  nonConformities: "ZoneTexte 11",
  title: "Titre 1",
} as const
