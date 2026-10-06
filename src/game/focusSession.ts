import type { FocusSession } from '../types'

/** Pure: milliseconds left in a session, may be negative once elapsed. */
export function remainingMs(session: FocusSession, now: Date): number {
  const endsAt = new Date(session.startedAt).getTime() + session.durationMinutes * 60_000
  return endsAt - now.getTime()
}

export function isElapsed(session: FocusSession, now: Date): boolean {
  return remainingMs(session, now) <= 0
}

/** Pure: formats milliseconds as "m:ss", floored at zero. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
