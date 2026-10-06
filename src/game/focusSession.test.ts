import { describe, expect, it } from 'vitest'
import type { FocusSession } from '../types'
import { formatCountdown, isElapsed, remainingMs } from './focusSession'

function session(partial: Partial<FocusSession> = {}): FocusSession {
  return {
    id: '1',
    taskId: null,
    taskTitle: 'Test task',
    durationMinutes: 25,
    startedAt: new Date(2024, 0, 1, 12, 0, 0).toISOString(),
    kind: 'focus',
    ...partial,
  }
}

describe('remainingMs', () => {
  it('is the full duration right at the start', () => {
    const s = session()
    const now = new Date(2024, 0, 1, 12, 0, 0)
    expect(remainingMs(s, now)).toBe(25 * 60_000)
  })

  it('counts down as time passes', () => {
    const s = session()
    const now = new Date(2024, 0, 1, 12, 10, 0)
    expect(remainingMs(s, now)).toBe(15 * 60_000)
  })

  it('goes negative after the duration elapses', () => {
    const s = session({ durationMinutes: 10 })
    const now = new Date(2024, 0, 1, 12, 15, 0)
    expect(remainingMs(s, now)).toBeLessThan(0)
  })
})

describe('isElapsed', () => {
  it('is false before the duration is up', () => {
    const s = session({ durationMinutes: 10 })
    expect(isElapsed(s, new Date(2024, 0, 1, 12, 5, 0))).toBe(false)
  })

  it('is true exactly at and after the duration', () => {
    const s = session({ durationMinutes: 10 })
    expect(isElapsed(s, new Date(2024, 0, 1, 12, 10, 0))).toBe(true)
    expect(isElapsed(s, new Date(2024, 0, 1, 12, 11, 0))).toBe(true)
  })
})

describe('formatCountdown', () => {
  it('formats whole minutes', () => {
    expect(formatCountdown(5 * 60_000)).toBe('5:00')
  })

  it('pads seconds under 10', () => {
    expect(formatCountdown(65_000)).toBe('1:05')
  })

  it('never goes negative', () => {
    expect(formatCountdown(-5000)).toBe('0:00')
  })
})
