import { describe, expect, it } from 'vitest'
import type { BossStep } from '../types'
import { bossHpFraction, createBossSteps, isBossDefeated } from './bossBattle'

describe('createBossSteps', () => {
  it('creates one step per non-empty title', () => {
    const steps = createBossSteps(['open the doc', 'write intro', 'send it'])
    expect(steps).toHaveLength(3)
    expect(steps.map((s) => s.title)).toEqual(['open the doc', 'write intro', 'send it'])
  })

  it('starts every step as not done', () => {
    const steps = createBossSteps(['a', 'b'])
    expect(steps.every((s) => !s.done)).toBe(true)
  })

  it('drops blank titles', () => {
    const steps = createBossSteps(['a', '  ', '', 'b'])
    expect(steps).toHaveLength(2)
  })

  it('caps at 5 steps', () => {
    const steps = createBossSteps(['1', '2', '3', '4', '5', '6', '7'])
    expect(steps).toHaveLength(5)
  })

  it('gives each step a unique id', () => {
    const steps = createBossSteps(['a', 'b', 'c'])
    expect(new Set(steps.map((s) => s.id)).size).toBe(3)
  })
})

function step(title: string, done: boolean): BossStep {
  return { id: title, title, done }
}

describe('bossHpFraction', () => {
  it('is 1 (full HP) with no steps done', () => {
    const steps = [step('a', false), step('b', false)]
    expect(bossHpFraction(steps)).toBe(1)
  })

  it('shrinks as steps complete', () => {
    const steps = [step('a', true), step('b', false), step('c', false), step('d', false)]
    expect(bossHpFraction(steps)).toBe(0.75)
  })

  it('is 0 once every step is done', () => {
    const steps = [step('a', true), step('b', true)]
    expect(bossHpFraction(steps)).toBe(0)
  })

  it('treats no steps at all as full HP', () => {
    expect(bossHpFraction([])).toBe(1)
  })
})

describe('isBossDefeated', () => {
  it('is false with an empty step list', () => {
    expect(isBossDefeated([])).toBe(false)
  })

  it('is false while any step is unfinished', () => {
    expect(isBossDefeated([step('a', true), step('b', false)])).toBe(false)
  })

  it('is true once every step is done', () => {
    expect(isBossDefeated([step('a', true), step('b', true)])).toBe(true)
  })
})
