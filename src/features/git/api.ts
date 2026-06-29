import {
  gitCommitsResponseSchema,
  type GitCommitsRequest,
} from "./types"

export async function fetchGitCommits(
  request: GitCommitsRequest
): Promise<string[]> {
  const res = await fetch("/api/git/commits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    let message = `Import git échoué (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      /* keep default */
    }
    throw new Error(message)
  }

  const { commits } = gitCommitsResponseSchema.parse(await res.json())
  return commits
}
