import { motion } from 'framer-motion'
import { METER_META } from '../../data/meterMeta'
import { RECURRING_META, RECURRING_ORDER } from '../../data/recurringMeta'
import { TASK_COMPLETE_RECOVERY } from '../../game/meters'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSound } from '../../hooks/useSound'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import type { RecurringKey, Task } from '../../types'

/** Always-visible one-tap self-care logging — no need to go find these in Quests. */
export function SelfCareRow() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { play } = useSound()
  const reducedMotion = useReducedMotion()

  const items = RECURRING_ORDER.filter((key) => state.settings.recurringEnabled[key])
    .map((key) => ({ key, task: state.tasks.find((t) => t.recurringKey === key) }))
    .filter((item): item is { key: RecurringKey; task: Task } => item.task !== undefined)

  if (items.length === 0) return null

  function logIt(task: Task) {
    dispatch({ type: 'LOG_RECURRING', taskId: task.id, now: new Date().toISOString() })
    toast.show(`Nice! +${TASK_COMPLETE_RECOVERY} ${METER_META[task.meter].label} 🎉`)
    play('complete')
  }

  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Quick self-care</p>
      <div className="flex flex-wrap gap-2">
        {items.map(({ key, task }) => (
          <motion.button
            key={key}
            type="button"
            onClick={() => logIt(task)}
            whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            <span aria-hidden="true">{RECURRING_META[key].emoji}</span>
            {RECURRING_META[key].label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
