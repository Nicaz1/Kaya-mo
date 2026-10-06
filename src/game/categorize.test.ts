import { describe, expect, it } from 'vitest'
import { categorizeTask } from './categorize'

describe('categorizeTask', () => {
  it.each([
    ['Call mom back', 'heart'],
    ['Text Sam about Friday', 'heart'],
    ['Do the laundry', 'nest'],
    ['Clear inbox for 10 min', 'focus'],
    ['Finish the deck for Monday', 'focus'],
    ['Follow up on the proposal', 'focus'],
    ['Drink a glass of water', 'body'],
    ['Eat lunch', 'body'],
    ['Take meds', 'body'],
    ['Dishes from last night', 'nest'],
  ] as const)('categorizes "%s" as %s', (title, meter) => {
    expect(categorizeTask(title)).toBe(meter)
  })

  it('is case-insensitive', () => {
    expect(categorizeTask('CALL grandma')).toBe('heart')
  })

  it('defaults to focus for an unrecognized one-liner', () => {
    expect(categorizeTask('xyzzy the thing')).toBe('focus')
  })
})
