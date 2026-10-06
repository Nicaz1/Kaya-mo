import { useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { useAppState } from '../../state/store'

const CHECK_INTERVAL_MS = 5 * 60 * 1000 // check every 5 min
const WATER_INTERVAL_MS = 90 * 60 * 1000 // nudge once ~90 min has passed since last sip
const WAKING_HOUR_START = 7
const WAKING_HOUR_END = 22

/** Mounted once, app-wide. Gently reminds about water during waking hours — never while asleep. */
export function WaterReminder() {
  const state = useAppState()
  const { notify } = useNotifications()
  const waterEnabled = state.settings.recurringEnabled.water
  const waterTask = state.tasks.find((t) => t.recurringKey === 'water')

  useEffect(() => {
    function check() {
      if (!waterEnabled || !waterTask) return
      const now = new Date()
      const hour = now.getHours()
      if (hour < WAKING_HOUR_START || hour >= WAKING_HOUR_END) return

      const last = waterTask.lastDoneAt
      const elapsed = last ? now.getTime() - new Date(last).getTime() : Infinity
      if (elapsed < WATER_INTERVAL_MS) return

      notify('Thirsty? 💧', "I'm parched... want to drink a glass of water with me?")
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [waterEnabled, waterTask, notify])

  return null
}
