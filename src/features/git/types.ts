import { z } from "zod"

/** Client-safe contracts for the git commit import endpoint. */
export const gitCommitsRequestSchema = z.object({
  repoPath: z.string().trim().min(1),
  since: z.iso.date().optional(),
  until: z.iso.date().optional(),
  author: z.string().trim().optional(),
})
export type GitCommitsRequest = z.infer<typeof gitCommitsRequestSchema>

export const gitCommitsResponseSchema = z.object({
  commits: z.array(z.string()),
})
export type GitCommitsResponse = z.infer<typeof gitCommitsResponseSchema>
