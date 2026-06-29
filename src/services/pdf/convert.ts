import "server-only"

import { spawn } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

/**
 * Converts a .pptx buffer to .pdf using the LibreOffice CLI in headless mode.
 * Runs in an isolated temp dir (LibreOffice writes the .pdf next to the input).
 * Server-only. Requires `soffice` on PATH (overridable via LIBREOFFICE_BIN).
 */

const SOFFICE_BIN = process.env.LIBREOFFICE_BIN ?? "soffice"
const CONVERT_TIMEOUT_MS = 60_000

export async function convertPptxToPdf(pptx: Buffer): Promise<Buffer> {
  const workDir = await mkdtemp(path.join(tmpdir(), "weekly-report-"))
  const pptxPath = path.join(workDir, "report.pptx")
  const pdfPath = path.join(workDir, "report.pdf")

  try {
    await writeFile(pptxPath, pptx)
    await runSoffice(workDir, pptxPath)
    return await readFile(pdfPath)
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

function runSoffice(workDir: string, pptxPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Per-call user profile avoids clashes when conversions run concurrently.
    const profile = `-env:UserInstallation=file://${path.join(workDir, "profile")}`
    const child = spawn(
      SOFFICE_BIN,
      [
        "--headless",
        "--norestore",
        profile,
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        pptxPath,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    )

    let stderr = ""
    child.stderr.on("data", (chunk) => (stderr += chunk))

    const timer = setTimeout(() => {
      child.kill("SIGKILL")
      reject(new Error("LibreOffice conversion timed out"))
    }, CONVERT_TIMEOUT_MS)

    child.on("error", (err) => {
      clearTimeout(timer)
      reject(err)
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      if (code === 0) resolve()
      else reject(new Error(`LibreOffice exited with code ${code}: ${stderr}`))
    })
  })
}
