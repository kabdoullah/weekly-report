/**
 * Timezone-aware "now" for the Friday-18h auto-send check. Uses `Intl` with an
 * explicit `timeZone` rather than relying on `Date`'s local getters — those
 * reflect the OS/ICU timezone resolved at process startup and don't reliably
 * pick up a `TZ` env var loaded later by Next.js's `.env` handling.
 */

const TIMEZONE = process.env.TZ || "Africa/Abidjan"

function currentParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  }
}

/** True if it's currently Friday in the app timezone. */
export function isFriday(date: Date = new Date()): boolean {
  return currentParts(date).weekday === "Fri"
}

/** Current time as "HH:mm" in the app timezone. */
export function currentHHmm(date: Date = new Date()): string {
  const { hour, minute } = currentParts(date)
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}
