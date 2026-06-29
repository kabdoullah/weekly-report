"use client"

import { useMutation } from "@tanstack/react-query"

import { rephraseTasks } from "../api"
import type { RephraseRequest } from "../types"

/** Mutation wrapper around the AI rephrase endpoint. */
export function useRephrase() {
  return useMutation({
    mutationFn: (request: RephraseRequest) => rephraseTasks(request),
  })
}
