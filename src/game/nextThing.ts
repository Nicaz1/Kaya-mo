import type { EnergyLevel, Meters, MeterKind, Task } from '../types'
import { lowestMeter } from './meters'

export type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night'

export function timeOfDayFor(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'midday'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

// Small nudges toward the kind of task that fits the moment — focus work in the
// morning, body/wind-down in the evening — not hard rules.
const METER_TIME_AFFINITY: Record<MeterKind, Partial<Record<TimeOfDay, number>>> = {
  focus: { morning: 8, midday: 6 },
  body: { morning: 4, midday: 4, evening: 6, night: 8 },
  nest: { midday: 4, evening: 6 },
  heart: { midday: 4, evening: 8 },
}

const ENERGY_RANK: Record<EnergyLevel, number> = { low: 0, medium: 1, high: 2 }

/** Body meter below this is treated as "overdue" — recurring body tasks jump the queue. */
const BODY_OVERDUE_THRESHOLD = 50

export type PickNextTaskOptions = {
  now?: Date
  energy?: EnergyLevel | null
  /** Injectable for deterministic tests; defaults to Math.random. */
  random?: () => number
}

/**
 * Pure: picks the single best "do this next" task from the open list.
 * Weighs (a) how starved the task's meter is, (b) match with current energy,
 * (c) time-of-day fit, (d) a little randomness for variety. Never returns more
 * than one task — the UI is only ever allowed to show one.
 */
export function pickNextTask(tasks: Task[], meters: Meters, options: PickNextTaskOptions = {}): Task | null {
  const openTasks = tasks.filter((t) => t.completedAt === null)
  if (openTasks.length === 0) return null

  const now = options.now ?? new Date()
  const energy = options.energy ?? null
  const random = options.random ?? Math.random
  const timeOfDay = timeOfDayFor(now.getHours())
  const lowest = lowestMeter(meters)

  let best: Task | null = null
  let bestScore = -Infinity

  for (const task of openTasks) {
    let score = 0

    // (a) reward tasks whose meter needs the most help.
    const deficit = 100 - meters[task.meter]
    score += deficit * 0.6
    if (task.meter === lowest) score += 10

    // Body overdue priority — stands in for real "last done" tracking until
    // recurring self-care gets its own timestamps.
    if (task.meter === 'body' && task.isRecurring && meters.body < BODY_OVERDUE_THRESHOLD) {
      score += 20
    }

    // (b) energy match — exact match is best, opposite ends of the scale is worst.
    if (energy && task.energy) {
      const gap = Math.abs(ENERGY_RANK[energy] - ENERGY_RANK[task.energy])
      score += (2 - gap) * 6
    }

    // (c) time-of-day fit
    score += METER_TIME_AFFINITY[task.meter]?.[timeOfDay] ?? 0

    // (d) a touch of randomness so the same state doesn't always suggest the same thing
    score += random() * 5

    if (score > bestScore) {
      bestScore = score
      best = task
    }
  }

  return best
}
