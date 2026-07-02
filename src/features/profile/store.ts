"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Profile {
  department: string
  mainProject: string
}

interface ProfileState extends Profile {
  setProfile: (profile: Profile) => void
}

/**
 * Identity fields entered once and reused across reports (persisted to
 * localStorage). New reports are pre-filled from here, and saving a report
 * refreshes it — so the user never re-types department/project each week.
 * `name` isn't stored here: it's pre-filled from the logged-in account
 * (`user.name`) instead, to avoid two sources of truth.
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      department: "",
      mainProject: "",
      setProfile: ({ department, mainProject }) =>
        set({ department, mainProject }),
    }),
    { name: "weekly-report-profile" }
  )
)
