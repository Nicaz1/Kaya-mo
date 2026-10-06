import type { Friend, FriendFrequency } from '../types'

const FREQUENCY_DAYS: Record<FriendFrequency, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
}

/** Pure: whole days since last contact, or null if never logged. */
export function daysSinceContact(friend: Friend, now: Date): number | null {
  if (!friend.lastContactedAt) return null
  const ms = now.getTime() - new Date(friend.lastContactedAt).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

/** Pure: a gentle nudge, never an "overdue" alert — true once meaningfully past their cadence. */
export function isGentleNudge(friend: Friend, now: Date): boolean {
  const days = daysSinceContact(friend, now)
  if (days === null) return true
  return days >= FREQUENCY_DAYS[friend.frequency]
}

/** Pure: friends worth a gentle nudge, longest-overdue (or never-contacted) first. */
export function suggestedFriends(friends: Friend[], now: Date): Friend[] {
  return friends
    .filter((f) => isGentleNudge(f, now))
    .sort((a, b) => {
      const daysA = daysSinceContact(a, now)
      const daysB = daysSinceContact(b, now)
      if (daysA === null && daysB === null) return 0
      if (daysA === null) return -1
      if (daysB === null) return 1
      return daysB - daysA
    })
}
