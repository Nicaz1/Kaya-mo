import { formatCountdown, remainingMs } from '../../game/focusSession'
import type { FocusSession } from '../../types'

type FocusTimerProps = {
  session: FocusSession
  now: Date
}

export function FocusTimer({ session, now }: FocusTimerProps) {
  const ms = Math.max(0, remainingMs(session, now))
  return <p className="text-5xl font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatCountdown(ms)}</p>
}
