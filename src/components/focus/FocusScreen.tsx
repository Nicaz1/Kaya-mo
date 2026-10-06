import { useEffect, useRef, useState } from 'react'
import { isElapsed } from '../../game/focusSession'
import { useNotifications } from '../../hooks/useNotifications'
import { useAppState } from '../../state/store'
import { FocusSessionView } from './FocusSessionView'
import { FocusSetup } from './FocusSetup'
import { SideQuestTimer } from './SideQuestTimer'

export function FocusScreen() {
  const state = useAppState()
  const [now, setNow] = useState(() => new Date())
  const notifications = useNotifications()
  const notifiedSessionIdRef = useRef<string | null>(null)

  // Tick once a second only while a session is active — no point ticking an idle setup screen.
  useEffect(() => {
    if (!state.focusSession) return
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [state.focusSession])

  // Nudge once per session, right as it naturally elapses — even if the tab isn't focused.
  useEffect(() => {
    const session = state.focusSession
    if (!session || !isElapsed(session, now)) return
    if (notifiedSessionIdRef.current === session.id) return
    notifiedSessionIdRef.current = session.id

    if (session.kind === 'side-quest') {
      notifications.notify('Kaya taps its watch ⌚', 'Ready to head back whenever you are.')
    } else {
      notifications.notify('Still on it?', `Checking in on "${session.taskTitle}" — no rush.`)
    }
  }, [state.focusSession, now, notifications])

  if (!state.focusSession) return <FocusSetup />
  if (state.focusSession.kind === 'side-quest') return <SideQuestTimer session={state.focusSession} now={now} />
  return <FocusSessionView session={state.focusSession} now={now} />
}
