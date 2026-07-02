"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as api from "../api"
import type { EmailStatus } from "../types/email-history.schema"
import { emailKeys } from "./keys"

export function useEmailHistory(status?: EmailStatus) {
  return useQuery({
    queryKey: [...emailKeys.history, status ?? "all"],
    queryFn: () => api.fetchEmailHistory(status),
  })
}

export function useResendEmail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.resendEmail(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailKeys.history }),
  })
}
