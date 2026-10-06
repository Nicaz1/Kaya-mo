import { useState } from 'react'
import { BossBattle } from '../boss/BossBattle'
import { METER_META, METER_ORDER } from '../../data/meterMeta'
import { useNavigation } from '../../state/navigation'
import { useAppDispatch, useAppState } from '../../state/store'
import type { MeterKind, Task } from '../../types'

const ONE_TAP_FOCUS_MINUTES = 25

export function QuestsScreen() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const { navigate } = useNavigation()
  const [openGroups, setOpenGroups] = useState<Record<MeterKind, boolean>>({
    focus: false,
    body: false,
    nest: false,
    heart: false,
  })
  const [bossTaskId, setBossTaskId] = useState<string | null>(null)

  const openTasks = state.tasks.filter((t) => t.completedAt === null)
  const bossTask = bossTaskId ? openTasks.find((t) => t.id === bossTaskId) : undefined

  return (
    <div className="px-4 pb-24 pt-8">
      <h1 className="mb-4 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">Quests</h1>
      <div className="space-y-3">
        {METER_ORDER.map((kind) => {
          const meta = METER_META[kind]
          const tasks = openTasks.filter((t) => t.meter === kind)
          const isOpen = openGroups[kind]
          return (
            <div key={kind} className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-white/5">
              <button
                type="button"
                className="flex min-h-14 w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpenGroups((g) => ({ ...g, [kind]: !g[kind] }))}
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {meta.emoji} {meta.label} <span className="font-normal text-slate-400">({tasks.length})</span>
                </span>
                <span className="text-xl text-slate-400" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <ul className="divide-y divide-slate-100 dark:divide-white/5">
                  {tasks.length === 0 && <li className="px-4 pb-4 text-sm text-slate-400">Nothing here right now.</li>}
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onReassign={(meter) => dispatch({ type: 'SET_TASK_METER', taskId: task.id, meter })}
                      onToggleDread={() => dispatch({ type: 'TOGGLE_TASK_DREAD', taskId: task.id })}
                      onFight={() => setBossTaskId(task.id)}
                      onFocus={() => {
                        dispatch({
                          type: 'START_FOCUS_SESSION',
                          session: {
                            id: crypto.randomUUID(),
                            taskId: task.id,
                            taskTitle: task.title,
                            durationMinutes: ONE_TAP_FOCUS_MINUTES,
                            startedAt: new Date().toISOString(),
                            kind: 'focus',
                          },
                        })
                        navigate('focus')
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {bossTask && <BossBattle task={bossTask} onClose={() => setBossTaskId(null)} />}
    </div>
  )
}

function TaskRow({
  task,
  onReassign,
  onToggleDread,
  onFight,
  onFocus,
}: {
  task: Task
  onReassign: (meter: MeterKind) => void
  onToggleDread: () => void
  onFight: () => void
  onFocus: () => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-700 dark:text-slate-200">{task.title}</span>
        <div className="flex shrink-0 items-center gap-1">
          {task.dread && (
            <button
              type="button"
              onClick={onFight}
              title="Fight this boss"
              aria-label={`Fight "${task.title}" as a boss battle`}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-base"
            >
              ⚔️
            </button>
          )}
          <button
            type="button"
            onClick={onToggleDread}
            aria-pressed={task.dread}
            title={task.dread ? 'Feels like a lot — tap to un-flag' : 'Flag this as a dreaded task'}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-base opacity-70"
          >
            {task.dread ? '😬' : '🙂'}
          </button>
          {task.energy && <span className="text-xs text-slate-400">{task.energy}</span>}
          <button
            type="button"
            onClick={onFocus}
            aria-label={`Start a focus session on "${task.title}"`}
            title="Start a focus session"
            className="flex min-h-10 min-w-10 items-center justify-center rounded-full text-base"
          >
            ⏱️
          </button>
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="min-h-10 rounded-full px-2 text-xs font-semibold text-focus underline-offset-2 hover:underline"
          >
            move
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-2 flex flex-wrap gap-2">
          {METER_ORDER.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                onReassign(kind)
                setEditing(false)
              }}
              className="min-h-9 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              {METER_META[kind].emoji} {METER_META[kind].label}
            </button>
          ))}
        </div>
      )}
    </li>
  )
}
