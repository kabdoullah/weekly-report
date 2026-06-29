"use client"

import { useMutation } from "@tanstack/react-query"

import { fetchGitCommits } from "../api"
import type { GitCommitsRequest } from "../types"

/** Mutation wrapper around the git commit import endpoint. */
export function useGitCommits() {
  return useMutation({
    mutationFn: (request: GitCommitsRequest) => fetchGitCommits(request),
  })
}
