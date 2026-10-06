import { describe, expect, it } from 'vitest'
import { canSendNudge, isQuietHour } from './notifications'

describe('isQuietHour', () => {
  it('is false when start equals end (quiet hours disabled)', () => {
    expect(isQuietHour(3, 9, 9)).toBe(false)
  })

  it('handles a same-day range', () => {
    expect(isQuietHour(10, 9, 17)).toBe(true)
    expect(isQuietHour(8, 9, 17)).toBe(false)
    expect(isQuietHour(17, 9, 17)).toBe(false)
  })

  it('handles an overnight range', () => {
    expect(isQuietHour(23, 21, 8)).toBe(true)
    expect(isQuietHour(3, 21, 8)).toBe(true)
    expect(isQuietHour(12, 21, 8)).toBe(false)
    expect(isQuietHour(21, 21, 8)).toBe(true)
    expect(isQuietHour(8, 21, 8)).toBe(false)
  })
})

describe('canSendNudge', () => {
  const now = new Date(2024, 0, 1, 12, 0, 0)

  it('allows a nudge with no recent history', () => {
    expect(canSendNudge([], now, 2)).toBe(true)
  })

  it('blocks when the cap is zero', () => {
    expect(canSendNudge([], now, 0)).toBe(false)
  })

  it('blocks once the cap is reached within the last hour', () => {
    const recent = [new Date(2024, 0, 1, 11, 50).toISOString()]
    expect(canSendNudge(recent, now, 1)).toBe(false)
  })

  it('ignores nudges older than an hour', () => {
    const old = [new Date(2024, 0, 1, 10, 0).toISOString()]
    expect(canSendNudge(old, now, 1)).toBe(true)
  })
})
