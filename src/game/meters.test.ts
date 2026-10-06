import { describe, expect, it } from 'vitest'
import type { Meters } from '../types'
import { applyMeterDelta, clampMeter, decayMeters, lowestMeter, METER_MAX, METER_MIN, moodForMeter } from './meters'

const FULL: Meters = { focus: 100, body: 100, nest: 100, heart: 100 }

describe('clampMeter', () => {
  it('never goes below the soft floor', () => {
    expect(clampMeter(-50)).toBe(METER_MIN)
  })

  it('never exceeds the max', () => {
    expect(clampMeter(500)).toBe(METER_MAX)
  })

  it('passes through in-range values', () => {
    expect(clampMeter(42)).toBe(42)
  })
})

describe('decayMeters', () => {
  it('does nothing for zero or negative elapsed time', () => {
    expect(decayMeters(FULL, 0)).toEqual(FULL)
    expect(decayMeters(FULL, -1000)).toEqual(FULL)
  })

  it('drains meters proportionally to elapsed hours', () => {
    const oneHour = 1000 * 60 * 60
    const next = decayMeters(FULL, oneHour)
    expect(next.focus).toBeCloseTo(94)
    expect(next.body).toBeCloseTo(92)
    expect(next.nest).toBeCloseTo(96)
    expect(next.heart).toBeCloseTo(97)
  })

  it('never drops any meter below the soft floor, even after a long absence', () => {
    const tenDays = 1000 * 60 * 60 * 24 * 10
    const next = decayMeters(FULL, tenDays)
    for (const value of Object.values(next)) {
      expect(value).toBeGreaterThanOrEqual(METER_MIN)
    }
  })

  it('does not mutate the input', () => {
    const before = { ...FULL }
    decayMeters(FULL, 1000 * 60 * 60)
    expect(FULL).toEqual(before)
  })
})

describe('applyMeterDelta', () => {
  it('increases the targeted meter and leaves others untouched', () => {
    const start: Meters = { focus: 50, body: 50, nest: 50, heart: 50 }
    const next = applyMeterDelta(start, 'body', 10)
    expect(next.body).toBe(60)
    expect(next.focus).toBe(50)
  })

  it('clamps at the max', () => {
    const next = applyMeterDelta(FULL, 'heart', 50)
    expect(next.heart).toBe(METER_MAX)
  })

  it('clamps at the soft floor when applying a big negative delta', () => {
    const start: Meters = { focus: 20, body: 50, nest: 50, heart: 50 }
    const next = applyMeterDelta(start, 'focus', -100)
    expect(next.focus).toBe(METER_MIN)
  })
})

describe('moodForMeter', () => {
  it.each([
    [100, 'great'],
    [70, 'great'],
    [60, 'okay'],
    [45, 'okay'],
    [30, 'low'],
    [25, 'low'],
    [20, 'droopy'],
    [METER_MIN, 'droopy'],
  ] as const)('maps %i to %s', (value, mood) => {
    expect(moodForMeter(value)).toBe(mood)
  })
})

describe('lowestMeter', () => {
  it('picks the meter with the smallest value', () => {
    expect(lowestMeter({ focus: 80, body: 30, nest: 90, heart: 50 })).toBe('body')
  })

  it('is deterministic on ties (first encountered wins)', () => {
    expect(lowestMeter({ focus: 50, body: 50, nest: 50, heart: 50 })).toBe('focus')
  })
})
