"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Profile {
  name: string
  department: string
  mainProject: string
}

interface ProfileState extends Profile {
  setProfile: (profile: Profile) => void
}

/**
 * Identity fields entered once and reused across reports (persisted to
 * localStorage). New reports are pre-filled from here, and saving a report
 * refreshes it — so the user never re-types name/department/project each week.
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      department: "",
      mainProject: "",
      setProfile: ({ name, department, mainProject }) =>
        set({ name, department, mainProject }),
    }),
    { name: "weekly-report-profile" }
  )
)
