import { describe, expect, it } from 'vitest'
import { pickDopamineSuggestion } from './dopamine'

describe('pickDopamineSuggestion', () => {
  it('returns null for an empty menu', () => {
    expect(pickDopamineSuggestion([])).toBeNull()
  })

  it('picks the first item when random is 0', () => {
    expect(pickDopamineSuggestion(['coffee', 'song', 'walk'], () => 0)).toBe('coffee')
  })

  it('picks the last item when random is just under 1', () => {
    expect(pickDopamineSuggestion(['coffee', 'song', 'walk'], () => 0.999)).toBe('walk')
  })

  it('always returns one of the menu items', () => {
    const menu = ['coffee', 'song', 'walk']
    for (let i = 0; i < 20; i++) {
      expect(menu).toContain(pickDopamineSuggestion(menu, Math.random))
    }
  })
})
