import { describe, expect, it } from 'vitest'
import { daysGapSince, isWelcomeBack, recordDayCared, totalDaysCared } from './streak'

describe('recordDayCared', () => {
  it('adds a new day', () => {
    const result = recordDayCared([], new Date(2024, 0, 1))
    expect(result).toEqual(['2024-01-01'])
  })

  it('does not duplicate the same day', () => {
    const result = recordDayCared(['2024-01-01'], new Date(2024, 0, 1, 23, 0))
    expect(result).toEqual(['2024-01-01'])
  })

  it('appends a second distinct day', () => {
    const result = recordDayCared(['2024-01-01'], new Date(2024, 0, 2))
    expect(result).toEqual(['2024-01-01', '2024-01-02'])
  })
})

describe('totalDaysCared', () => {
  it('counts unique days', () => {
    expect(totalDaysCared(['2024-01-01', '2024-01-02'])).toBe(2)
  })
})

describe('daysGapSince', () => {
  it('is 0 when never seen before (treated as brand new)', () => {
    expect(daysGapSince(null, new Date(2024, 0, 5))).toBe(0)
  })

  it('is 0 for the same calendar day', () => {
    const lastSeen = new Date(2024, 0, 5, 8, 0).toISOString()
    expect(daysGapSince(lastSeen, new Date(2024, 0, 5, 20, 0))).toBe(0)
  })

  it('is 1 for the very next calendar day', () => {
    const lastSeen = new Date(2024, 0, 5).toISOString()
    expect(daysGapSince(lastSeen, new Date(2024, 0, 6))).toBe(1)
  })

  it('counts correctly across a month boundary', () => {
    const lastSeen = new Date(2024, 0, 30).toISOString()
    expect(daysGapSince(lastSeen, new Date(2024, 1, 2))).toBe(3)
  })
})

describe('isWelcomeBack', () => {
  it('is false for brand-new users (never seen)', () => {
    expect(isWelcomeBack(null, new Date(2024, 0, 5))).toBe(false)
  })

  it('is false for ordinary day-to-day use', () => {
    const lastSeen = new Date(2024, 0, 5).toISOString()
    expect(isWelcomeBack(lastSeen, new Date(2024, 0, 6))).toBe(false)
  })

  it('is true once at least one full day was skipped', () => {
    const lastSeen = new Date(2024, 0, 5).toISOString()
    expect(isWelcomeBack(lastSeen, new Date(2024, 0, 7))).toBe(true)
  })
})
