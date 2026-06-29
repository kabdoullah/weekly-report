"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import * as api from "../api"
import type { ReportInput } from "../types/report.schema"

/** Query keys for the reports cache. */
export const reportKeys = {
  all: ["reports"] as const,
  detail: (id: string) => ["reports", id] as const,
}

export function useReports() {
  return useQuery({
    queryKey: reportKeys.all,
    queryFn: api.fetchReports,
  })
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: reportKeys.detail(id ?? ""),
    queryFn: () => api.fetchReport(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReportInput) => api.createReport(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  })
}

export function useUpdateReport(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ReportInput) => api.updateReport(id, input),
    onSuccess: (report) => {
      qc.invalidateQueries({ queryKey: reportKeys.all })
      qc.setQueryData(reportKeys.detail(id), report)
    },
  })
}

export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  })
}
