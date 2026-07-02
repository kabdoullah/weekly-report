"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as api from "../api"
import type { EmailSettingsInput } from "../types/email-settings.schema"
import { emailKeys } from "./keys"

export function useEmailSettings() {
  return useQuery({
    queryKey: emailKeys.settings,
    queryFn: api.fetchEmailSettings,
  })
}

export function useUpdateEmailSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EmailSettingsInput) => api.updateEmailSettings(input),
    onSuccess: (settings) => {
      qc.setQueryData(emailKeys.settings, settings)
    },
  })
}
