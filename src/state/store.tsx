import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { applyMeterDelta, decayMeters, NEUTRAL_METER_VALUE, TASK_COMPLETE_RECOVERY } from '../game/meters'
import { daysGapSince, recordDayCared, WELCOME_BACK_GAP_DAYS } from '../game/streak'
import { addXp, XP_PER_BOSS_STEP, XP_PER_FOCUS_SESSION, XP_PER_TASK } from '../game/xp'
import { defaultState, migrate, STATE_KEY } from '../storage/schema'
import { readJSON, writeJSON } from '../storage/storage'
import type { AppState } from '../types'
import type { Action } from './actions'

const METER_TICK_INTERVAL_MS = 60_000

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REPLACE_STATE':
      return action.state
    case 'TICK_METERS': {
      const elapsedMs = new Date(action.now).getTime() - new Date(state.lastMeterUpdateAt).getTime()
      if (elapsedMs <= 0) return state
      return { ...state, meters: decayMeters(state.meters, elapsedMs), lastMeterUpdateAt: action.now }
    }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] }
    case 'SET_TASK_METER':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, meter: action.meter } : t)),
      }
    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.taskId)
      if (!task || task.completedAt !== null) return state
      const { pet } = addXp(state.pet, XP_PER_TASK)
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, completedAt: action.now } : t)),
        meters: applyMeterDelta(state.meters, task.meter, TASK_COMPLETE_RECOVERY),
        pet,
      }
    }
    case 'LOG_RECURRING': {
      const task = state.tasks.find((t) => t.id === action.taskId)
      if (!task) return state
      const { pet } = addXp(state.pet, XP_PER_TASK)
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, lastDoneAt: action.now } : t)),
        meters: applyMeterDelta(state.meters, task.meter, TASK_COMPLETE_RECOVERY),
        pet,
      }
    }
    case 'BREAK_DOWN_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, title: action.firstStep, parkedNote: t.title } : t,
        ),
      }
    case 'START_FOCUS_SESSION':
      return { ...state, focusSession: action.session }
    case 'EXTEND_FOCUS_SESSION':
      if (!state.focusSession) return state
      return {
        ...state,
        focusSession: {
          ...state.focusSession,
          startedAt: action.startedAt,
          durationMinutes: action.durationMinutes ?? state.focusSession.durationMinutes,
        },
      }
    case 'CLEAR_FOCUS_SESSION':
      return { ...state, focusSession: null }
    case 'COMPLETE_FOCUS_SESSION': {
      const session = state.focusSession
      if (!session) return state
      const { pet } = addXp(state.pet, XP_PER_FOCUS_SESSION)
      let tasks = state.tasks
      let meters = state.meters
      if (session.taskId) {
        const task = state.tasks.find((t) => t.id === session.taskId)
        if (task && task.completedAt === null) {
          tasks = state.tasks.map((t) => (t.id === session.taskId ? { ...t, completedAt: action.now } : t))
          meters = applyMeterDelta(state.meters, task.meter, TASK_COMPLETE_RECOVERY)
        }
      }
      return { ...state, tasks, meters, pet, focusSession: null }
    }
    case 'TOGGLE_TASK_DREAD':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, dread: !t.dread } : t)),
      }
    case 'SET_BOSS_STEPS':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, bossSteps: action.steps } : t)),
      }
    case 'TOGGLE_BOSS_STEP': {
      const task = state.tasks.find((t) => t.id === action.taskId)
      const stepToToggle = task?.bossSteps?.find((s) => s.id === action.stepId)
      if (!task || !task.bossSteps || !stepToToggle) return state

      const turningOn = !stepToToggle.done
      const steps = task.bossSteps.map((s) => (s.id === action.stepId ? { ...s, done: !s.done } : s))
      const allDone = steps.every((s) => s.done)

      const pet = turningOn ? addXp(state.pet, XP_PER_BOSS_STEP).pet : state.pet
      let tasks = state.tasks.map((t) => (t.id === action.taskId ? { ...t, bossSteps: steps } : t))
      let meters = state.meters

      if (allDone && task.completedAt === null) {
        tasks = tasks.map((t) => (t.id === action.taskId ? { ...t, completedAt: action.now } : t))
        meters = applyMeterDelta(state.meters, task.meter, TASK_COMPLETE_RECOVERY)
      }

      return { ...state, tasks, meters, pet }
    }
    case 'ADD_FRIEND':
      return { ...state, friends: [...state.friends, action.friend] }
    case 'LOG_CONTACT': {
      const friend = state.friends.find((f) => f.id === action.friendId)
      if (!friend) return state
      const { pet } = addXp(state.pet, XP_PER_TASK)
      return {
        ...state,
        friends: state.friends.map((f) => (f.id === action.friendId ? { ...f, lastContactedAt: action.now } : f)),
        meters: applyMeterDelta(state.meters, 'heart', TASK_COMPLETE_RECOVERY),
        pet,
      }
    }
    case 'APP_OPENED': {
      const now = new Date(action.now)
      const gap = daysGapSince(state.lastSeenAt, now)
      const daysCared = recordDayCared(state.daysCared, now)
      if (gap >= WELCOME_BACK_GAP_DAYS) {
        // A real absence, not just the normal rhythm of daily use — ease back in
        // at a neutral middle rather than wherever decay left things.
        return {
          ...state,
          lastSeenAt: action.now,
          daysCared,
          meters: {
            focus: NEUTRAL_METER_VALUE,
            body: NEUTRAL_METER_VALUE,
            nest: NEUTRAL_METER_VALUE,
            heart: NEUTRAL_METER_VALUE,
          },
          lastMeterUpdateAt: action.now,
        }
      }
      return { ...state, lastSeenAt: action.now, daysCared }
    }
    case 'SET_MORNING_CHECKIN':
      return {
        ...state,
        checkIn: {
          ...state.checkIn,
          lastMorningAt: action.now,
          energy: action.energy,
          winsToday: action.winsToday,
          mustDoToday: action.mustDoToday,
        },
      }
    case 'SET_EVENING_CHECKIN':
      return {
        ...state,
        tasks: action.tomorrowTask ? [...state.tasks, action.tomorrowTask] : state.tasks,
        checkIn: { ...state.checkIn, lastEveningAt: action.now, proudOf: action.proudOf },
      }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    case 'SET_DOPAMINE_MENU':
      return { ...state, dopamineMenu: action.items }
    default:
      return state
  }
}

/**
 * Computed once at load time, before APP_OPENED overwrites lastSeenAt — lets a
 * component decide whether to show the welcome-back banner for this session
 * without needing a persisted "have we shown this yet" flag.
 */
let welcomeBackGapAtLoad = 0

export function getWelcomeBackGapAtLoad(): number {
  return welcomeBackGapAtLoad
}

function loadInitialState(): AppState {
  const raw = readJSON<unknown>(STATE_KEY)
  const state = raw === null ? defaultState() : migrate(raw)
  welcomeBackGapAtLoad = daysGapSince(state.lastSeenAt, new Date())
  return state
}

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)

  // Persist on every change. State is small (a handful of lists + a few
  // numbers), so writing the whole blob each time is simple and fast enough.
  useEffect(() => {
    writeJSON(STATE_KEY, state)
  }, [state])

  // Drain meters with real elapsed time, including the gap since last visit.
  useEffect(() => {
    dispatch({ type: 'TICK_METERS', now: new Date().toISOString() })
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_METERS', now: new Date().toISOString() })
    }, METER_TICK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Record today, update lastSeenAt, and ease back in gently after a real absence.
  // Runs once per mount by design — this is a "the app opened" event, not a value sync.
  useEffect(() => {
    dispatch({ type: 'APP_OPENED', now: new Date().toISOString() })
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext)
  if (ctx === null) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

export function useAppDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext)
  if (ctx === null) throw new Error('useAppDispatch must be used within AppProvider')
  return ctx
}
