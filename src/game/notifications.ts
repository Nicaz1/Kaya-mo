/** Pure: true if `hour` (0-23) falls within quiet hours, handling overnight wraparound (e.g. 21 → 8). */
export function isQuietHour(hour: number, quietHoursStart: number, quietHoursEnd: number): boolean {
  if (quietHoursStart === quietHoursEnd) return false
  if (quietHoursStart < quietHoursEnd) {
    return hour >= quietHoursStart && hour < quietHoursEnd
  }
  return hour >= quietHoursStart || hour < quietHoursEnd
}

/** Pure: true if another nudge is allowed given nudges already sent in the last hour. */
export function canSendNudge(recentNudgeTimestamps: string[], now: Date, maxPerHour: number): boolean {
  if (maxPerHour <= 0) return false
  const oneHourAgo = now.getTime() - 60 * 60 * 1000
  const recentCount = recentNudgeTimestamps.filter((t) => new Date(t).getTime() >= oneHourAgo).length
  return recentCount < maxPerHour
}
