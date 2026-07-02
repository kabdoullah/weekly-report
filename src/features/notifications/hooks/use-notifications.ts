"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as api from "../api"

const notificationKeys = {
  all: ["notifications"] as const,
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: api.fetchNotifications,
    // Poll so a notification from the server-side scheduler shows up without a manual refresh.
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}
