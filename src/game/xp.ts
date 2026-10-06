import type { Pet } from '../types'

const BASE_XP = 20
const XP_GROWTH_PER_LEVEL = 15

/** XP awarded for each kind of win — small and frequent, by design. */
export const XP_PER_TASK = 10
export const XP_PER_FOCUS_SESSION = 20
export const XP_PER_BOSS_STEP = 8

/** Pure: total cumulative XP required to REACH a given level (level 1 needs 0). */
export function xpRequiredForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) {
    total += BASE_XP + (l - 1) * XP_GROWTH_PER_LEVEL
  }
  return total
}

/** Pure: derives the current level from cumulative XP. */
export function levelForXp(totalXp: number): number {
  let level = 1
  while (totalXp >= xpRequiredForLevel(level + 1)) {
    level++
  }
  return level
}

/** Pure: progress within the current level, for a progress bar. */
export function xpIntoCurrentLevel(totalXp: number): { current: number; needed: number } {
  const level = levelForXp(totalXp)
  const floor = xpRequiredForLevel(level)
  const ceiling = xpRequiredForLevel(level + 1)
  return { current: totalXp - floor, needed: ceiling - floor }
}

/** Pure: adds XP to a pet, recomputing its level. Handles multi-level jumps in one call. */
export function addXp(pet: Pet, amount: number): { pet: Pet; leveledUp: boolean } {
  const newXp = pet.xp + amount
  const newLevel = levelForXp(newXp)
  return {
    pet: { ...pet, xp: newXp, level: newLevel },
    leveledUp: newLevel > pet.level,
  }
}
