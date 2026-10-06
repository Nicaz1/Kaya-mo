/**
 * "Days I showed up" — a gentle streak that only ever grows. Missing a day
 * just pauses it; there's no consecutive-day count to lose. See the
 * "welcome back" helpers below for how a longer absence is handled.
 */

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Pure: adds today's date to the cared-for list if it isn't already there. */
export function recordDayCared(daysCared: string[], now: Date): string[] {
  const key = toDateKey(now)
  if (daysCared.includes(key)) return daysCared
  return [...daysCared, key]
}

export function totalDaysCared(daysCared: string[]): number {
  return daysCared.length
}

/** Pure: whole calendar days between a past visit and now (0 = today, 1 = yesterday...). */
export function daysGapSince(lastSeenAt: string | null, now: Date): number {
  if (!lastSeenAt) return 0
  const diffMs = startOfDay(now) - startOfDay(new Date(lastSeenAt))
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * At least one full day was skipped entirely (not just "yesterday vs today"
 * normal daily use) — this is when a warm "welcome back" and a meter reset
 * feel right, rather than every single morning.
 */
export const WELCOME_BACK_GAP_DAYS = 2

export function isWelcomeBack(lastSeenAt: string | null, now: Date): boolean {
  return daysGapSince(lastSeenAt, now) >= WELCOME_BACK_GAP_DAYS
}
