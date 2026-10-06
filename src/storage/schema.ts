import { DOPAMINE_MENU_DEFAULTS } from '../data/dopamineMenu'
import { seedFriends } from '../data/seedFriends'
import { seedTasks } from '../data/seedTasks'
import { NEUTRAL_METER_VALUE } from '../game/meters'
import type { AppState } from '../types'

export const SCHEMA_VERSION = 1
export const STATE_KEY = 'state'

export function defaultState(now: string = new Date().toISOString()): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    tasks: seedTasks(),
    friends: seedFriends(),
    pet: { xp: 0, level: 1, unlockedItemIds: [], equippedItemId: null },
    meters: {
      focus: NEUTRAL_METER_VALUE,
      body: NEUTRAL_METER_VALUE,
      nest: NEUTRAL_METER_VALUE,
      heart: NEUTRAL_METER_VALUE,
    },
    lastMeterUpdateAt: now,
    focusSession: null,
    checkIn: { lastMorningAt: null, lastEveningAt: null, energy: null, winsToday: [], mustDoToday: null, proudOf: null },
    settings: {
      theme: 'system',
      soundOn: true,
      notificationsEnabled: false,
      quietHoursStart: 21,
      quietHoursEnd: 8,
      maxNudgesPerHour: 1,
      recurringEnabled: {
        water: true,
        breakfast: true,
        lunch: true,
        dinner: true,
        meds: false,
        movement: true,
        windDown: true,
      },
    },
    daysCared: [],
    dopamineMenu: DOPAMINE_MENU_DEFAULTS,
    lastSeenAt: now,
  }
}

/**
 * Validates & upgrades whatever was in localStorage. Unknown shape or a
 * version we don't recognize falls back to a fresh default state rather
 * than crashing the app — losing data is far worse than losing a pet's XP.
 */
export function migrate(raw: unknown): AppState {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'schemaVersion' in raw &&
    (raw as { schemaVersion: unknown }).schemaVersion === SCHEMA_VERSION
  ) {
    return raw as AppState
  }
  // Future schema bumps add real migrations here, keyed by the old version.
  return defaultState()
}
