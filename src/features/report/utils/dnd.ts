import type { DayActions } from "../types/report.schema"

export const DAY_DROP_PREFIX = "day:"

/** Locate a block by its id across all days. */
function findBlock(days: DayActions[], blockId: string) {
  for (let d = 0; d < days.length; d++) {
    const b = days[d].blocks.findIndex((block) => block.id === blockId)
    if (b !== -1) return { dayIndex: d, blockIndex: b }
  }
  return null
}

/**
 * Returns a new `days` array with the dragged block moved next to / into the
 * drop target. `overId` is either another block's id or a `day:<index>` droppable
 * (used when dropping onto an empty day). Returns `null` when nothing changes.
 */
export function relocateBlock(
  days: DayActions[],
  activeId: string,
  overId: string
): DayActions[] | null {
  if (activeId === overId) return null

  const source = findBlock(days, activeId)
  if (!source) return null

  let targetDay: number
  let insertIndex: number

  if (overId.startsWith(DAY_DROP_PREFIX)) {
    targetDay = Number(overId.slice(DAY_DROP_PREFIX.length))
    insertIndex = days[targetDay]?.blocks.length ?? 0
  } else {
    const target = findBlock(days, overId)
    if (!target) return null
    targetDay = target.dayIndex
    insertIndex = target.blockIndex
  }

  if (Number.isNaN(targetDay) || !days[targetDay]) return null

  // Clone the affected arrays (shallow per level is enough — block objects reused).
  const next = days.map((day) => ({ ...day, blocks: [...day.blocks] }))
  const [moved] = next[source.dayIndex].blocks.splice(source.blockIndex, 1)

  // Same-day move where removal precedes the target shifts the index left by one.
  if (targetDay === source.dayIndex && source.blockIndex < insertIndex) {
    insertIndex -= 1
  }

  next[targetDay].blocks.splice(insertIndex, 0, moved)
  return next
}
