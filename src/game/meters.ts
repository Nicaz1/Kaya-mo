import type { Meters, MeterKind } from '../types'

/**
 * The pet never dies and never looks truly empty — meters have a soft floor.
 * Worst case is "a bit droopy," never zero. See mood copy in data/copy.ts.
 */
export const METER_MIN = 15
export const METER_MAX = 100

/** Where meters start for a brand-new user, and where "welcome back" resets them to. */
export const NEUTRAL_METER_VALUE = 70

/** How much a meter recovers when its task gets marked done — big and fast, on purpose. */
export const TASK_COMPLETE_RECOVERY = 15

/** How many points each meter drains per hour of real time, left untouched. */
const DECAY_PER_HOUR: Record<MeterKind, number> = {
  focus: 6,
  body: 8,
  nest: 4,
  heart: 3,
}

export function clampMeter(value: number): number {
  return Math.min(METER_MAX, Math.max(METER_MIN, value))
}

/** Pure: decays every meter by the elapsed real time. Never mutates the input. */
export function decayMeters(meters: Meters, elapsedMs: number): Meters {
  if (elapsedMs <= 0) return meters
  const hours = elapsedMs / (1000 * 60 * 60)
  const next = { ...meters }
  for (const kind of Object.keys(DECAY_PER_HOUR) as MeterKind[]) {
    next[kind] = clampMeter(meters[kind] - DECAY_PER_HOUR[kind] * hours)
  }
  return next
}

/** Pure: nudges one meter by a delta (positive for recovery, negative for decay). */
export function applyMeterDelta(meters: Meters, kind: MeterKind, delta: number): Meters {
  return { ...meters, [kind]: clampMeter(meters[kind] + delta) }
}

export type Mood = 'great' | 'okay' | 'low' | 'droopy'

export function moodForMeter(value: number): Mood {
  if (value >= 70) return 'great'
  if (value >= 45) return 'okay'
  if (value >= 25) return 'low'
  return 'droopy'
}

/** The meter most in need of attention right now — feeds the next-thing picker later. */
export function lowestMeter(meters: Meters): MeterKind {
  const kinds = Object.keys(meters) as MeterKind[]
  return kinds.reduce((lowest, kind) => (meters[kind] < meters[lowest] ? kind : lowest))
}
