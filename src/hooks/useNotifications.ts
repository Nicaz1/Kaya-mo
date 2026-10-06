import { useCallback, useRef } from 'react'
import { canSendNudge, isQuietHour } from '../game/notifications'
import { useAppState } from '../state/store'

/**
 * Thin wrapper around the browser Notifications API. All the "should this
 * actually fire" logic (quiet hours, per-hour cap) lives in game/notifications.ts
 * as pure, tested functions — this hook just wires them to real permissions
 * and a rolling window of recent sends.
 */
export function useNotifications() {
  const state = useAppState()
  const recentRef = useRef<string[]>([])

  const isSupported = typeof window !== 'undefined' && 'Notification' in window
  const permission = isSupported ? Notification.permission : 'denied'

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return 'denied'
    return Notification.requestPermission()
  }, [isSupported])

  /** Returns true if the notification actually fired. Always phrased as Kaya asking, never commanding. */
  const notify = useCallback(
    (title: string, body: string): boolean => {
      if (!isSupported) return false
      if (!state.settings.notificationsEnabled) return false
      if (Notification.permission !== 'granted') return false

      const now = new Date()
      if (isQuietHour(now.getHours(), state.settings.quietHoursStart, state.settings.quietHoursEnd)) return false
      if (!canSendNudge(recentRef.current, now, state.settings.maxNudgesPerHour)) return false

      recentRef.current = [...recentRef.current, now.toISOString()].slice(-20)
      new Notification(title, { body })
      return true
    },
    [isSupported, state.settings],
  )

  return { isSupported, permission, requestPermission, notify }
}
