import { isElapsed } from '../../game/focusSession'
import { useAppDispatch } from '../../state/store'
import type { FocusSession } from '../../types'
import { FocusTimer } from './FocusTimer'

const EXTEND_MINUTES = 10

type SideQuestTimerProps = {
  session: FocusSession
  now: Date
}

export function SideQuestTimer({ session, now }: SideQuestTimerProps) {
  const dispatch = useAppDispatch()
  const elapsed = isElapsed(session, now)

  function backToIt() {
    dispatch({ type: 'CLEAR_FOCUS_SESSION' })
  }

  function moreTime() {
    dispatch({ type: 'EXTEND_FOCUS_SESSION', startedAt: new Date().toISOString(), durationMinutes: EXTEND_MINUTES })
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Side quest</p>

      {elapsed ? (
        <>
          <p className="text-5xl">⌚</p>
          <p className="max-w-xs text-slate-600 dark:text-slate-300">Kaya tapped its watch. Ready to head back?</p>
          <div className="flex gap-2">
            <button type="button" onClick={backToIt} className="min-h-11 rounded-full bg-focus px-5 font-semibold text-white">
              Back to it
            </button>
            <button
              type="button"
              onClick={moreTime}
              className="min-h-11 rounded-full border border-slate-200 px-5 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              A bit more time
            </button>
          </div>
        </>
      ) : (
        <>
          <FocusTimer session={session} now={now} />
          <button type="button" onClick={backToIt} className="min-h-11 rounded-full px-4 text-sm text-slate-400">
            I'm back early
          </button>
        </>
      )}
    </div>
  )
}
