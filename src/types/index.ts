// Shared types for Kaya. Kept in one file for now since the app is small;
// split by domain if this grows past a couple hundred lines.

export type MeterKind = 'focus' | 'body' | 'nest' | 'heart'

export type Screen = 'home' | 'quests' | 'focus' | 'friends' | 'settings'

export type EnergyLevel = 'low' | 'medium' | 'high'

/** 0-100 for each life area. Never allowed to hit true zero — see game/meters.ts. */
export type Meters = Record<MeterKind, number>

/** Keys for the built-in recurring self-care prompts (water, meals, etc). */
export type RecurringKey = 'water' | 'breakfast' | 'lunch' | 'dinner' | 'meds' | 'movement' | 'windDown'

export interface BossStep {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  meter: MeterKind
  energy?: EnergyLevel
  dread: boolean
  createdAt: string // ISO timestamp
  completedAt: string | null
  isRecurring: boolean
  recurringKey?: RecurringKey
  /** Last time a recurring task was logged — recurring tasks never get a permanent completedAt. */
  lastDoneAt?: string | null
  /** Present once the user taps "Fight" on a dreaded task. */
  bossSteps?: BossStep[]
  /** The leftover note parked by the "Too big" button, shown later. */
  parkedNote?: string
}

export type FriendFrequency = 'weekly' | 'monthly' | 'quarterly'

export interface Friend {
  id: string
  name: string
  frequency: FriendFrequency
  lastContactedAt: string | null
}

export interface Pet {
  xp: number
  level: number
  unlockedItemIds: string[]
  equippedItemId: string | null
}

export type FocusSessionKind = 'focus' | 'side-quest'

export interface FocusSession {
  id: string
  /** Null for a free-typed focus target or a side quest (not tied to a specific task). */
  taskId: string | null
  taskTitle: string
  durationMinutes: number
  startedAt: string // ISO timestamp — countdown is derived, never stored per-tick
  kind: FocusSessionKind
}

export interface CheckInState {
  lastMorningAt: string | null
  lastEveningAt: string | null
  energy: EnergyLevel | null
  winsToday: string[]
  mustDoToday: string | null
  proudOf: string | null
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  soundOn: boolean
  notificationsEnabled: boolean
  quietHoursStart: number // 0-23, local hour
  quietHoursEnd: number // 0-23, local hour
  maxNudgesPerHour: number
  recurringEnabled: Record<RecurringKey, boolean>
}

export interface AppState {
  schemaVersion: 1
  tasks: Task[]
  friends: Friend[]
  pet: Pet
  meters: Meters
  lastMeterUpdateAt: string
  focusSession: FocusSession | null
  checkIn: CheckInState
  settings: Settings
  /** Unique ISO date strings (yyyy-mm-dd) the app was used — gentle streak, never resets. */
  daysCared: string[]
  dopamineMenu: string[]
  lastSeenAt: string | null
}
