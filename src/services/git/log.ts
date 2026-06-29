import "server-only"

import { execFile } from "node:child_process"
import { promisify } from "node:util"

const exec = promisify(execFile)

export interface GitLogParams {
  /** Absolute path to a local git repository. */
  repoPath: string
  /** Inclusive lower bound (ISO date, yyyy-MM-dd). */
  since?: string
  /** Inclusive upper bound (ISO date, yyyy-MM-dd). */
  until?: string
  /** Limit author to this name/email substring. */
  author?: string
}

/**
 * Reads commit subjects from a local repo via `git log`. Read-only. Uses
 * `execFile` (no shell) so args can't be interpolated into a command string.
 * Intended for local/personal use — it runs git against a user-supplied path.
 */
export async function getCommitSubjects(
  params: GitLogParams
): Promise<string[]> {
  const args = ["-C", params.repoPath, "log", "--no-merges", "--pretty=format:%s"]
  if (params.since) args.push(`--since=${params.since} 00:00:00`)
  if (params.until) args.push(`--until=${params.until} 23:59:59`)
  if (params.author) args.push(`--author=${params.author}`)

  try {
    const { stdout } = await exec("git", args, {
      maxBuffer: 5 * 1024 * 1024,
      timeout: 15_000,
    })
    return stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
  } catch (error) {
    const stderr =
      typeof (error as { stderr?: unknown })?.stderr === "string"
        ? (error as { stderr: string }).stderr
        : ""
    const message = `${error instanceof Error ? error.message : String(error)} ${stderr}`
    if (/not a git repository|does not exist|No such file|cannot change/i.test(message)) {
      throw new Error("Chemin de dépôt git invalide")
    }
    throw new Error("Échec de la lecture des commits")
  }
}
