import type { AppState, BossStep, EnergyLevel, FocusSession, Friend, MeterKind, Settings, Task } from '../types'

// Action union grows as each feature lands (quick capture, task completion,
// focus sessions, boss battles, friends, check-ins...). Kept in its own file
// so store.tsx stays focused on wiring, not the list of things that can happen.
export type Action =
  | { type: 'REPLACE_STATE'; state: AppState }
  /** Dispatched periodically so meters drain with real elapsed time, even across refreshes. */
  | { type: 'TICK_METERS'; now: string }
  /** Quick Capture — the task's meter is already guessed by game/categorize.ts before dispatch. */
  | { type: 'ADD_TASK'; task: Task }
  /** "I can fix it later" — moving a mis-guessed task to the right meter. */
  | { type: 'SET_TASK_METER'; taskId: string; meter: MeterKind }
  /** "Done" on the next-task card — completes the task and recovers its meter. */
  | { type: 'COMPLETE_TASK'; taskId: string; now: string }
  /** One-tap self-care logging (water, meals, movement...) — recovers the meter but never "completes" the task, since it repeats. */
  | { type: 'LOG_RECURRING'; taskId: string; now: string }
  /** "Too big" — replaces the task with just its tiny first step, parking the rest. */
  | { type: 'BREAK_DOWN_TASK'; taskId: string; firstStep: string }
  /** Starts a focus session or side quest — only one runs at a time. */
  | { type: 'START_FOCUS_SESSION'; session: FocusSession }
  /** "Yes, keep going" / "A bit more time" — restarts the countdown, optionally with a new duration. */
  | { type: 'EXTEND_FOCUS_SESSION'; startedAt: string; durationMinutes?: number }
  /** "I drifted, that's okay" / "Back to it" / manual cancel — no guilt, just stop the clock. */
  | { type: 'CLEAR_FOCUS_SESSION' }
  /** "Done" on the rabbit-hole check — completes the linked task (if any) and awards session XP. */
  | { type: 'COMPLETE_FOCUS_SESSION'; now: string }
  /** Flags/unflags a task as a "boss" — dreaded tasks get the Fight option in Quests. */
  | { type: 'TOGGLE_TASK_DREAD'; taskId: string }
  /** Commits the 3-5 tiny steps a boss gets split into (typed or template-picked). */
  | { type: 'SET_BOSS_STEPS'; taskId: string; steps: BossStep[] }
  /** Chips off boss HP one step at a time; completes the task once every step is done. */
  | { type: 'TOGGLE_BOSS_STEP'; taskId: string; stepId: string; now: string }
  /** Adding someone to the Friends list — no required fields beyond name + frequency. */
  | { type: 'ADD_FRIEND'; friend: Friend }
  /** One-tap "texted" / "called" / "hung out" — recovers Heart, no overdue shame either way. */
  | { type: 'LOG_CONTACT'; friendId: string; now: string }
  /** Dispatched once per app load — records the day, updates lastSeenAt, and resets meters to neutral after a real absence. */
  | { type: 'APP_OPENED'; now: string }
  /** The ≤60s morning check-in — energy, up to 3 wins, one optional must-do. */
  | { type: 'SET_MORNING_CHECKIN'; energy: EnergyLevel; winsToday: string[]; mustDoToday: string | null; now: string }
  /** The optional evening wind-down — one proud-of note, plus tomorrow's first tiny task. */
  | { type: 'SET_EVENING_CHECKIN'; proudOf: string | null; tomorrowTask: Task | null; now: string }
  /** Settings screen — partial merge so each control only needs to send what it changed. */
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
  /** Editing the dopamine menu (add/remove quick rewards) — replaces the whole list. */
  | { type: 'SET_DOPAMINE_MENU'; items: string[] }
