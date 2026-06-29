/**
 * Splices freshly built paragraph XML into a named shape of a slide's XML,
 * preserving the shape's <a:bodyPr> and <a:lstStyle> (autofit, anchor, list
 * styles). Pure string surgery — no parser, to keep the rest of the OOXML byte
 * for byte identical to the template.
 */
export function replaceShapeParagraphs(
  slideXml: string,
  shapeName: string,
  paragraphsXml: string
): string {
  const nameIdx = slideXml.indexOf(`name="${shapeName}"`)
  if (nameIdx < 0) {
    throw new Error(`Shape not found in template: ${shapeName}`)
  }

  const txStart = slideXml.indexOf("<p:txBody>", nameIdx)
  const txEnd = slideXml.indexOf("</p:txBody>", txStart)
  if (txStart < 0 || txEnd < 0) {
    throw new Error(`<p:txBody> not found for shape: ${shapeName}`)
  }

  // Keep everything up to and including </a:lstStyle>; replace the paragraphs.
  const lstClose = slideXml.indexOf("</a:lstStyle>", txStart)
  if (lstClose < 0 || lstClose > txEnd) {
    throw new Error(`<a:lstStyle> not found for shape: ${shapeName}`)
  }
  const headEnd = lstClose + "</a:lstStyle>".length

  return slideXml.slice(0, headEnd) + paragraphsXml + slideXml.slice(txEnd)
}
