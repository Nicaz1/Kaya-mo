import { describe, expect, it } from 'vitest'
import type { Meters } from '../types'
import { getPetLine } from './copy'

describe('getPetLine', () => {
  it('comments on the lowest meter when something is low', () => {
    const meters: Meters = { focus: 80, body: 20, nest: 80, heart: 80 }
    expect(getPetLine(meters)).toMatch(/water/i)
  })

  it('celebrates when a meter is thriving and nothing is low', () => {
    const meters: Meters = { focus: 90, body: 90, nest: 90, heart: 90 }
    expect(getPetLine(meters)).toBeTruthy()
  })

  it('falls back to a neutral greeting in the middle range', () => {
    const meters: Meters = { focus: 60, body: 60, nest: 60, heart: 60 }
    expect(getPetLine(meters)).toMatch(/glad you're here/i)
  })
})
