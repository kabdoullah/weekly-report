"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Template } from "./types"

interface TemplateState {
  templates: Template[]
  addTemplate: (template: Omit<Template, "id">) => void
  removeTemplate: (id: string) => void
}

/** Project/module presets, persisted to localStorage. */
export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) =>
        set((state) => ({
          templates: [
            ...state.templates,
            { ...template, id: crypto.randomUUID() },
          ],
        })),
      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
    }),
    { name: "weekly-report-templates" }
  )
)
