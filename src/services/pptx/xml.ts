/**
 * Minimal DrawingML (OOXML) string builders. We regenerate the text bodies of
 * the template's shapes by hand to keep byte-for-byte control over run/paragraph
 * formatting. Keep this module pure and string-only (no I/O).
 */

const FONT = "Consolas"

/** Escape text destined for an <a:t> node or an XML attribute value. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export type Fill =
  | { kind: "scheme"; val: string; lumMod?: number }
  | { kind: "srgb"; hex: string }

function fillXml(fill: Fill): string {
  if (fill.kind === "srgb") {
    return `<a:solidFill><a:srgbClr val="${fill.hex}"/></a:solidFill>`
  }
  const inner =
    fill.lumMod != null ? `<a:lumMod val="${fill.lumMod}"/>` : ""
  return `<a:solidFill><a:schemeClr val="${fill.val}">${inner}</a:schemeClr></a:solidFill>`
}

export interface RunStyle {
  /** Font size in hundredths of a point (sz="1000" => 10pt). */
  sz: number
  bold?: boolean
  fill: Fill
}

/** A single formatted text run (<a:r>). */
export function run(text: string, style: RunStyle): string {
  const b = style.bold ? ' b="1"' : ' b="0"'
  return (
    `<a:r><a:rPr lang="fr-FR" sz="${style.sz}"${b}>` +
    fillXml(style.fill) +
    `<a:latin typeface="${FONT}"/><a:ea typeface="${FONT}"/><a:cs typeface="${FONT}"/>` +
    `</a:rPr><a:t>${escapeXml(text)}</a:t></a:r>`
  )
}

export type Bullet = "square" | "dot" | "none"

function bulletXml(bullet: Bullet): string {
  switch (bullet) {
    case "square":
      // Wingdings filled square, matching the template's block headers.
      return `<a:buFont typeface="Wingdings,Sans-Serif"/><a:buChar char="q"/>`
    case "dot":
      return `<a:buFont typeface="Arial,Sans-Serif"/><a:buChar char="•"/>`
    case "none":
      return `<a:buNone/>`
  }
}

export interface ParagraphOptions {
  bullet?: Bullet
  /** Left-indent + hanging indent used by the bulleted body paragraphs. */
  indented?: boolean
  /** Horizontal alignment, e.g. "l" | "ctr". */
  align?: string
}

/** A paragraph (<a:p>) wrapping pre-built run XML. */
export function paragraph(runsXml: string, opts: ParagraphOptions = {}): string {
  const attrs: string[] = []
  if (opts.indented) attrs.push('marL="171450"', 'lvl="1"', 'indent="-171450"')
  if (opts.align) attrs.push(`algn="${opts.align}"`)
  const pPr = `<a:pPr${attrs.length ? " " + attrs.join(" ") : ""}>${bulletXml(
    opts.bullet ?? "none"
  )}<a:defRPr/></a:pPr>`
  return `<a:p>${pPr}${runsXml}</a:p>`
}
