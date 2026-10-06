import { useState } from 'react'
import { pickDopamineSuggestion } from '../../game/dopamine'
import { isElapsed } from '../../game/focusSession'
import { XP_PER_FOCUS_SESSION } from '../../game/xp'
import { useSound } from '../../hooks/useSound'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import type { FocusSession } from '../../types'
import { Pet } from '../pet/Pet'
import { FocusTimer } from './FocusTimer'

type FocusSessionViewProps = {
  session: FocusSession
  now: Date
}

export function FocusSessionView({ session, now }: FocusSessionViewProps) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { play } = useSound()
  const [manualCheckIn, setManualCheckIn] = useState(false)

  const showCheckIn = isElapsed(session, now) || manualCheckIn

  function keepGoing() {
    dispatch({ type: 'EXTEND_FOCUS_SESSION', startedAt: new Date().toISOString() })
    setManualCheckIn(false)
  }

  function drifted() {
    dispatch({ type: 'CLEAR_FOCUS_SESSION' })
    toast.show('No worries — ready when you are.')
  }

  function done() {
    dispatch({ type: 'COMPLETE_FOCUS_SESSION', now: new Date().toISOString() })
    const suggestion = pickDopamineSuggestion(state.dopamineMenu)
    toast.show(
      suggestion
        ? `Great focus session! +${XP_PER_FOCUS_SESSION} XP 🎉 How about: ${suggestion}?`
        : `Great focus session! +${XP_PER_FOCUS_SESSION} XP 🎉`,
    )
    play('complete')
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-10 text-center">
      <Pet meters={state.meters} working={!showCheckIn} />

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Focusing on</p>
        <p className="max-w-xs text-lg font-semibold text-slate-800 dark:text-slate-100">{session.taskTitle}</p>
      </div>

      {showCheckIn ? (
        <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-sm dark:bg-white/5">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Still on it?</p>
          <div className="grid gap-2">
            <button type="button" onClick={keepGoing} className="min-h-11 rounded-full bg-focus font-semibold text-white">
              Yes, keep going
            </button>
            <button
              type="button"
              onClick={drifted}
              className="min-h-11 rounded-full border border-slate-200 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              I drifted, that's okay
            </button>
            <button
              type="button"
              onClick={done}
              className="min-h-11 rounded-full border border-slate-200 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <FocusTimer session={session} now={now} />
          <button type="button" onClick={() => setManualCheckIn(true)} className="min-h-11 rounded-full px-4 text-sm text-slate-400">
            Check in now
          </button>
        </>
      )}
    </div>
  )
}
