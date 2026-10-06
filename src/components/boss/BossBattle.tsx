import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { BOSS_STEP_TEMPLATES } from '../../data/bossTemplates'
import { bossHpFraction, createBossSteps, isBossDefeated } from '../../game/bossBattle'
import { pickDopamineSuggestion } from '../../game/dopamine'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSound } from '../../hooks/useSound'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import type { Task } from '../../types'
import { Modal } from '../shared/Modal'

type BossBattleProps = {
  task: Task
  onClose: () => void
}

export function BossBattle({ task, onClose }: BossBattleProps) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { play } = useSound()
  const reducedMotion = useReducedMotion()
  const [draftStep, setDraftStep] = useState('')
  const [draftSteps, setDraftSteps] = useState<string[]>([])

  const steps = task.bossSteps

  function addDraftStep() {
    const title = draftStep.trim()
    if (!title || draftSteps.length >= 5) return
    setDraftSteps((s) => [...s, title])
    setDraftStep('')
  }

  function useTemplate() {
    setDraftSteps(BOSS_STEP_TEMPLATES)
  }

  function startFight() {
    if (draftSteps.length === 0) return
    dispatch({ type: 'SET_BOSS_STEPS', taskId: task.id, steps: createBossSteps(draftSteps) })
  }

  function toggleStep(stepId: string) {
    dispatch({ type: 'TOGGLE_BOSS_STEP', taskId: task.id, stepId, now: new Date().toISOString() })
    if (!steps) return
    const afterToggle = steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s))
    if (isBossDefeated(afterToggle)) {
      const suggestion = pickDopamineSuggestion(state.dopamineMenu)
      toast.show(
        suggestion
          ? `Boss defeated! "${task.title}" is done 🏆 Treat yourself: ${suggestion}?`
          : `Boss defeated! "${task.title}" is done 🏆`,
      )
      play('defeat')
      onClose()
    } else {
      play('complete')
    }
  }

  // Step 1: no steps committed yet — break the boss down.
  if (!steps || steps.length === 0) {
    return (
      <Modal onClose={onClose}>
        <h2 className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-100">⚔️ Fight: {task.title}</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Break it into 3-5 tiny steps. The first one should be almost silly small.
        </p>

        {draftSteps.length > 0 && (
          <ol className="mb-3 space-y-1">
            {draftSteps.map((s, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300">
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        )}

        {draftSteps.length < 5 && (
          <div className="mb-3 flex gap-2">
            <input
              value={draftStep}
              onChange={(e) => setDraftStep(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDraftStep()}
              placeholder="e.g. open the doc"
              className="min-h-11 flex-1 rounded-full border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
            />
            <button type="button" onClick={addDraftStep} className="min-h-11 rounded-full bg-focus px-4 text-sm font-semibold text-white">
              Add
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={useTemplate} className="text-sm font-semibold text-focus underline-offset-2 hover:underline">
            Suggest steps for me
          </button>
          <button
            type="button"
            onClick={startFight}
            disabled={draftSteps.length === 0}
            className="min-h-11 rounded-full bg-focus px-5 font-semibold text-white disabled:opacity-50"
          >
            Start fight
          </button>
        </div>
      </Modal>
    )
  }

  // Step 2: steps committed — show boss HP and chip away at it.
  const hpPct = bossHpFraction(steps) * 100

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-100">⚔️ {task.title}</h2>
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-red-400"
          animate={{ width: `${hpPct}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'easeOut' }}
        />
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {steps.map((step) => (
            <motion.li
              key={step.id}
              layout={!reducedMotion}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                aria-pressed={step.done}
                className={`flex min-h-10 min-w-10 items-center justify-center rounded-full border text-sm ${
                  step.done ? 'border-focus bg-focus text-white' : 'border-slate-300 text-transparent dark:border-white/20'
                }`}
              >
                ✓
              </button>
              <span className={`text-slate-700 dark:text-slate-200 ${step.done ? 'line-through opacity-50' : ''}`}>
                {step.title}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Modal>
  )
}
