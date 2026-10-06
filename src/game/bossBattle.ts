import type { BossStep } from '../types'

const MAX_STEPS = 5

/** Pure: builds boss steps from titles, capped at 5, each starting un-done. */
export function createBossSteps(titles: string[]): BossStep[] {
  return titles
    .map((title) => title.trim())
    .filter(Boolean)
    .slice(0, MAX_STEPS)
    .map((title) => ({ id: crypto.randomUUID(), title, done: false }))
}

/** Pure: boss "HP" remaining as a 0-1 fraction — 1 means untouched, 0 means defeated. */
export function bossHpFraction(steps: BossStep[]): number {
  if (steps.length === 0) return 1
  const remaining = steps.filter((s) => !s.done).length
  return remaining / steps.length
}

export function isBossDefeated(steps: BossStep[]): boolean {
  return steps.length > 0 && steps.every((s) => s.done)
}
