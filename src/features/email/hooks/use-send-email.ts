"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import * as api from "../api"
import type { ComposeEmailInput, ScheduleEmailInput } from "../types/compose.schema"
import { emailKeys } from "./keys"

export function useSendReportEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ComposeEmailInput) => api.sendReportEmail(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailKeys.history }),
  })
}

export function useDraftReportEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ComposeEmailInput) => api.draftReportEmail(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailKeys.history }),
  })
}

export function useScheduleReportEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ScheduleEmailInput) => api.scheduleReportEmail(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailKeys.history }),
  })
}
