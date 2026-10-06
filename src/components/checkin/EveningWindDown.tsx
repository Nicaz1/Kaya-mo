import { useState } from 'react'
import { categorizeTask } from '../../game/categorize'
import { daysGapSince } from '../../game/streak'
import { useAppDispatch, useAppState } from '../../state/store'
import { Modal } from '../shared/Modal'
import { Pet } from '../pet/Pet'

const SLEEP_DISPLAY_MS = 1800

/** Optional ≤60s evening wind-down. Available any time — no assumptions about anyone's schedule. */
export function EveningWindDown() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [proudOf, setProudOf] = useState('')
  const [tomorrow, setTomorrow] = useState('')
  const [justSlept, setJustSlept] = useState(false)

  const now = new Date()
  const doneTodayCount = state.tasks.filter((t) => {
    const stamp = t.completedAt ?? t.lastDoneAt
    return stamp && daysGapSince(stamp, now) === 0
  }).length

  function submit() {
    const title = tomorrow.trim()
    const tomorrowTask = title
      ? {
          id: crypto.randomUUID(),
          title,
          meter: categorizeTask(title),
          dread: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          isRecurring: false,
        }
      : null

    dispatch({
      type: 'SET_EVENING_CHECKIN',
      proudOf: proudOf.trim() || null,
      tomorrowTask,
      now: new Date().toISOString(),
    })

    setJustSlept(true)
    setTimeout(() => {
      setJustSlept(false)
      setOpen(false)
      setProudOf('')
      setTomorrow('')
    }, SLEEP_DISPLAY_MS)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400"
      >
        🌙 Evening wind-down
      </button>
    )
  }

  return (
    <Modal onClose={() => !justSlept && setOpen(false)}>
      {justSlept ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Pet meters={state.meters} sleeping />
          <p className="font-semibold text-slate-700 dark:text-slate-200">Goodnight. See you tomorrow 🌙</p>
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">Evening wind-down</h2>

          <p className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">What got done today</p>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            {doneTodayCount === 0 ? "Nothing logged yet — that's okay." : `${doneTodayCount} thing${doneTodayCount === 1 ? '' : 's'} ✓`}
          </p>

          <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="proud-of">
            One thing you're proud of
          </label>
          <input
            id="proud-of"
            value={proudOf}
            onChange={(e) => setProudOf(e.target.value)}
            className="mb-4 min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
          />

          <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="tomorrow-task">
            Tomorrow's first tiny task
          </label>
          <input
            id="tomorrow-task"
            value={tomorrow}
            onChange={(e) => setTomorrow(e.target.value)}
            placeholder="Optional"
            className="mb-4 min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
          />

          <button type="button" onClick={submit} className="min-h-11 w-full rounded-full bg-focus font-semibold text-white">
            Goodnight
          </button>
        </>
      )}
    </Modal>
  )
}
