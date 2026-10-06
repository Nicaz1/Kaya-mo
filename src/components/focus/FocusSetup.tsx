import { useState } from 'react'
import { pickNextTask } from '../../game/nextThing'
import { useAppDispatch, useAppState } from '../../state/store'

const DURATIONS = [10, 15, 25, 45]
const DEFAULT_DURATION = 25
const SIDE_QUEST_MINUTES = 15

export function FocusSetup() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const suggested = pickNextTask(state.tasks, state.meters, { energy: state.checkIn.energy })
  const [customTitle, setCustomTitle] = useState('')
  const [duration, setDuration] = useState(DEFAULT_DURATION)

  const taskTitle = customTitle.trim() || suggested?.title || ''
  const taskId = customTitle.trim() ? null : (suggested?.id ?? null)

  function start() {
    if (!taskTitle) return
    dispatch({
      type: 'START_FOCUS_SESSION',
      session: {
        id: crypto.randomUUID(),
        taskId,
        taskTitle,
        durationMinutes: duration,
        startedAt: new Date().toISOString(),
        kind: 'focus',
      },
    })
  }

  function startSideQuest() {
    dispatch({
      type: 'START_FOCUS_SESSION',
      session: {
        id: crypto.randomUUID(),
        taskId: null,
        taskTitle: 'Side quest',
        durationMinutes: SIDE_QUEST_MINUTES,
        startedAt: new Date().toISOString(),
        kind: 'side-quest',
      },
    })
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 pb-24 pt-10">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Focus</h1>
      <p className="max-w-xs text-center text-slate-500 dark:text-slate-400">
        Kaya will work right next to you. No pressure, just company.
      </p>

      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-white/5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="focus-task">
            What are you focusing on?
          </label>
          <input
            id="focus-task"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={suggested?.title ?? 'Type a task...'}
            className="min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
          />
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">For how long?</p>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                aria-pressed={d === duration}
                className={`min-h-11 flex-1 rounded-full border text-sm font-semibold ${
                  d === duration
                    ? 'border-focus bg-focus text-white'
                    : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={start}
          disabled={!taskTitle}
          className="min-h-11 w-full rounded-full bg-focus font-semibold text-white disabled:opacity-50"
        >
          Start focus session
        </button>
      </div>

      <button
        type="button"
        onClick={startSideQuest}
        className="min-h-11 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400"
      >
        🧭 Start a side quest ({SIDE_QUEST_MINUTES}m)
      </button>
    </div>
  )
}
