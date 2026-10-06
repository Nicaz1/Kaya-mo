import { describe, expect, it } from 'vitest'
import type { Friend } from '../types'
import { daysSinceContact, isGentleNudge, suggestedFriends } from './friends'

const NOW = new Date(2024, 0, 31)

function friend(partial: Partial<Friend> & Pick<Friend, 'name' | 'frequency'>): Friend {
  return { id: partial.name, lastContactedAt: null, ...partial }
}

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

describe('daysSinceContact', () => {
  it('is null when never contacted', () => {
    expect(daysSinceContact(friend({ name: 'Sam', frequency: 'monthly' }), NOW)).toBeNull()
  })

  it('counts whole days since contact', () => {
    const f = friend({ name: 'Sam', frequency: 'monthly', lastContactedAt: daysAgo(10) })
    expect(daysSinceContact(f, NOW)).toBe(10)
  })
})

describe('isGentleNudge', () => {
  it('is always true for never-contacted friends', () => {
    expect(isGentleNudge(friend({ name: 'Sam', frequency: 'quarterly' }), NOW)).toBe(true)
  })

  it('is false when well within the weekly cadence', () => {
    const f = friend({ name: 'Sam', frequency: 'weekly', lastContactedAt: daysAgo(2) })
    expect(isGentleNudge(f, NOW)).toBe(false)
  })

  it('is true once past the weekly cadence', () => {
    const f = friend({ name: 'Sam', frequency: 'weekly', lastContactedAt: daysAgo(8) })
    expect(isGentleNudge(f, NOW)).toBe(true)
  })

  it('respects monthly vs quarterly cadence differently', () => {
    const monthly = friend({ name: 'Sam', frequency: 'monthly', lastContactedAt: daysAgo(40) })
    const quarterly = friend({ name: 'Alex', frequency: 'quarterly', lastContactedAt: daysAgo(40) })
    expect(isGentleNudge(monthly, NOW)).toBe(true)
    expect(isGentleNudge(quarterly, NOW)).toBe(false)
  })
})

describe('suggestedFriends', () => {
  it('excludes friends within their cadence', () => {
    const recent = friend({ name: 'Sam', frequency: 'weekly', lastContactedAt: daysAgo(1) })
    expect(suggestedFriends([recent], NOW)).toEqual([])
  })

  it('orders longest-overdue first', () => {
    const a = friend({ name: 'A', frequency: 'weekly', lastContactedAt: daysAgo(10) })
    const b = friend({ name: 'B', frequency: 'weekly', lastContactedAt: daysAgo(30) })
    expect(suggestedFriends([a, b], NOW).map((f) => f.name)).toEqual(['B', 'A'])
  })

  it('puts never-contacted friends first', () => {
    const contacted = friend({ name: 'A', frequency: 'weekly', lastContactedAt: daysAgo(30) })
    const never = friend({ name: 'B', frequency: 'weekly' })
    expect(suggestedFriends([contacted, never], NOW).map((f) => f.name)).toEqual(['B', 'A'])
  })
})
