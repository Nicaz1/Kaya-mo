import { describe, expect, it } from 'vitest'
import { defaultState, migrate, SCHEMA_VERSION } from './schema'

describe('defaultState', () => {
  it('starts meters at a neutral middle, not empty', () => {
    const state = defaultState()
    expect(state.meters.focus).toBeGreaterThan(50)
    expect(state.meters.body).toBeGreaterThan(50)
    expect(state.meters.nest).toBeGreaterThan(50)
    expect(state.meters.heart).toBeGreaterThan(50)
  })

  it('seeds starter tasks across all four meters', () => {
    const state = defaultState()
    const meters = new Set(state.tasks.map((t) => t.meter))
    expect(meters).toEqual(new Set(['focus', 'body', 'nest', 'heart']))
  })

  it('stamps the current schema version', () => {
    expect(defaultState().schemaVersion).toBe(SCHEMA_VERSION)
  })
})

describe('migrate', () => {
  it('passes through state matching the current schema version', () => {
    const state = defaultState()
    const taggedState = { ...state, tasks: [] }
    expect(migrate(taggedState)).toBe(taggedState)
  })

  it('falls back to default state for null', () => {
    expect(migrate(null).schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('falls back to default state for garbage input', () => {
    expect(migrate({ foo: 'bar' }).schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('falls back to default state for an unrecognized version', () => {
    const state = defaultState()
    expect(migrate({ ...state, schemaVersion: 999 }).schemaVersion).toBe(SCHEMA_VERSION)
  })
})
