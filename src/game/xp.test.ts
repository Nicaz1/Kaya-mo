import { describe, expect, it } from 'vitest'
import type { Pet } from '../types'
import { addXp, levelForXp, xpIntoCurrentLevel, xpRequiredForLevel } from './xp'

const PET: Pet = { xp: 0, level: 1, unlockedItemIds: [], equippedItemId: null }

describe('xpRequiredForLevel', () => {
  it('level 1 requires 0 XP', () => {
    expect(xpRequiredForLevel(1)).toBe(0)
  })

  it('increases monotonically', () => {
    const levels = [1, 2, 3, 4, 5].map(xpRequiredForLevel)
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThan(levels[i - 1])
    }
  })
})

describe('levelForXp', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(levelForXp(0)).toBe(1)
  })

  it('reaches level 2 exactly at the level-2 threshold', () => {
    const threshold = xpRequiredForLevel(2)
    expect(levelForXp(threshold - 1)).toBe(1)
    expect(levelForXp(threshold)).toBe(2)
  })

  it('handles a big XP jump across multiple levels', () => {
    expect(levelForXp(xpRequiredForLevel(5))).toBe(5)
  })
})

describe('xpIntoCurrentLevel', () => {
  it('is zero right at a level boundary', () => {
    const { current } = xpIntoCurrentLevel(xpRequiredForLevel(3))
    expect(current).toBe(0)
  })

  it('needed matches the gap to the next level', () => {
    const { needed } = xpIntoCurrentLevel(xpRequiredForLevel(2))
    expect(needed).toBe(xpRequiredForLevel(3) - xpRequiredForLevel(2))
  })
})

describe('addXp', () => {
  it('increases xp and leaves level alone when below threshold', () => {
    const { pet, leveledUp } = addXp(PET, 5)
    expect(pet.xp).toBe(5)
    expect(pet.level).toBe(1)
    expect(leveledUp).toBe(false)
  })

  it('flags a level-up when crossing the threshold', () => {
    const threshold = xpRequiredForLevel(2)
    const { pet, leveledUp } = addXp(PET, threshold)
    expect(pet.level).toBe(2)
    expect(leveledUp).toBe(true)
  })

  it('handles multiple level-ups from one big award', () => {
    const { pet, leveledUp } = addXp(PET, xpRequiredForLevel(5))
    expect(pet.level).toBe(5)
    expect(leveledUp).toBe(true)
  })

  it('does not mutate the input pet', () => {
    const before = { ...PET }
    addXp(PET, 100)
    expect(PET).toEqual(before)
  })
})
