/**
 * Starts the auto-send/scheduled-send poller once per server process.
 * `globalThis` (not a module-level flag) guards against `register()` being
 * invoked more than once in the same process — e.g. on dev HMR, where the
 * module itself gets re-evaluated but `globalThis` persists.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const globalWithFlag = globalThis as typeof globalThis & {
    __weeklyReportSchedulerStarted?: boolean
  }
  if (globalWithFlag.__weeklyReportSchedulerStarted) return
  globalWithFlag.__weeklyReportSchedulerStarted = true

  const { startScheduler } = await import("@/services/scheduler/poller")
  startScheduler()
}
