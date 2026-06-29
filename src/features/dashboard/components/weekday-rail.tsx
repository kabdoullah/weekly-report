import { cn } from "@/lib/utils"

/** Lun · Mar · Mer · Jeu · Ven — the working-week unit the whole app is built on. */
const DAYS = [
  { letter: "L", label: "Lundi" },
  { letter: "M", label: "Mardi" },
  { letter: "M", label: "Mercredi" },
  { letter: "J", label: "Jeudi" },
  { letter: "V", label: "Vendredi" },
] as const

interface WeekdayRailProps {
  /** 0–4 for the day to mark (e.g. today on the current-week hero); -1 / undefined for none. */
  active?: number
  size?: "sm" | "lg"
  className?: string
}

/**
 * The signature device: a five-cell weekday rail. It encodes the constant the
 * product is about — a report is always Lundi→Vendredi. On the hero the active
 * cell marks today (a real, live datum); elsewhere it reads as an identity mark.
 */
export function WeekdayRail({ active = -1, size = "sm", className }: WeekdayRailProps) {
  return (
    <div
      role="img"
      aria-label="Semaine de travail, lundi au vendredi"
      className={cn(
        "inline-grid grid-cols-5 overflow-hidden rounded-[3px] border border-border bg-card font-mono leading-none",
        className
      )}
    >
      {DAYS.map((day, i) => {
        const on = i === active
        return (
          <span
            key={i}
            title={day.label}
            className={cn(
              "flex items-center justify-center border-border tabular-nums",
              i > 0 && "border-l",
              size === "lg" ? "size-9 text-sm" : "size-5 text-[0.65rem]",
              on
                ? "bg-signal font-bold text-signal-foreground"
                : "text-muted-foreground"
            )}
          >
            {day.letter}
          </span>
        )
      })}
    </div>
  )
}
