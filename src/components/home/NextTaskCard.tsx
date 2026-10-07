import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { METER_META } from '../../data/meterMeta'
import { TASK_COMPLETE_RECOVERY } from '../../game/meters'
import { pickNextTask } from '../../game/nextThing'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSound } from '../../hooks/useSound'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'

export function NextTaskCard() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { play } = useSound()
  const reducedMotion = useReducedMotion()
  const [skippedIds, setSkippedIds] = useState<string[]>([])
  const [breakingDown, setBreakingDown] = useState(false)
  const [firstStep, setFirstStep] = useState('')

  const candidateTasks = useMemo(
    () => state.tasks.filter((t) => t.completedAt === null && !skippedIds.includes(t.id)),
    [state.tasks, skippedIds],
  )

  const task = useMemo(
    () => pickNextTask(candidateTasks, state.meters, { energy: state.checkIn.energy }),
    [candidateTasks, state.meters, state.checkIn.energy],
  )

  if (!task) {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center text-slate-500 shadow-sm dark:bg-white/5 dark:text-slate-400">
        Nothing queued up right now. Nice.
      </div>
    )
  }

  const meta = METER_META[task.meter]

  function markDone() {
    if (!task) return
    const now = new Date().toISOString()
    if (task.isRecurring) {
      dispatch({ type: 'LOG_RECURRING', taskId: task.id, now })
    } else {
      dispatch({ type: 'COMPLETE_TASK', taskId: task.id, now })
    }
    toast.show(`Nice! +${TASK_COMPLETE_RECOVERY} ${meta.label} 🎉`)
    play('complete')
    setSkippedIds([])
  }

  function skip() {
    if (!task) return
    setSkippedIds((ids) => [...ids, task.id])
  }

  function submitBreakDown() {
    if (!task) return
    const step = firstStep.trim()
    if (step) {
      dispatch({ type: 'BREAK_DOWN_TASK', taskId: task.id, firstStep: step })
    }
    setBreakingDown(false)
    setFirstStep('')
  }

  return (
    <motion.div
      key={task.id}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-sm dark:bg-white/5"
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {meta.emoji} {meta.label} · do this next
      </p>
      <p className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>

      {breakingDown ? (
        <div className="space-y-2">
          <label className="block text-sm text-slate-500 dark:text-slate-400" htmlFor="first-step">
            What's the smallest first step?
          </label>
          <input
            id="first-step"
            autoFocus
            value={firstStep}
            onChange={(e) => setFirstStep(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitBreakDown()}
            placeholder="e.g. open the doc"
            className="min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
          />
          <div className="flex gap-2">
            <button type="button" onClick={submitBreakDown} className="min-h-11 flex-1 rounded-full bg-focus font-semibold text-white">
              That's the one
            </button>
            <button type="button" onClick={() => setBreakingDown(false)} className="min-h-11 rounded-full px-4 text-slate-400">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            type="button"
            onClick={markDone}
            whileTap={reducedMotion ? undefined : { scale: 0.93 }}
            className="min-h-11 rounded-full bg-focus font-semibold text-white"
          >
            Done
          </motion.button>
          <button
            type="button"
            onClick={() => setBreakingDown(true)}
            className="min-h-11 rounded-full border border-slate-200 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
          >
            Too big
          </button>
          <button type="button" onClick={skip} className="min-h-11 rounded-full px-4 text-sm text-slate-400">
            Not now
          </button>
          <button type="button" onClick={skip} className="min-h-11 rounded-full px-4 text-sm text-slate-400">
            Something else
          </button>
        </div>
      )}
    </motion.div>
  )
}
