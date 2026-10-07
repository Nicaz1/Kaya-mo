import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { pullState, pushState } from '../../state/cloudSync'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import type { AppState } from '../../types'
import { Modal } from './Modal'

const PUSH_DEBOUNCE_MS = 2000

/**
 * Mounted once, app-wide. Entirely inert unless the user has signed in via
 * Settings — localStorage keeps working exactly as before either way.
 */
export function CloudSyncManager() {
  const { user } = useAuth()
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [remoteConflict, setRemoteConflict] = useState<AppState | null>(null)
  const prevUserIdRef = useRef<string | null>(null)
  const pushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncActiveRef = useRef(false)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // On sign-in, pull once: adopt as the synced baseline if nothing exists yet,
  // otherwise ask which copy to keep. Keyed only on user — reads current
  // state via stateRef so it isn't re-triggered by every meter tick.
  useEffect(() => {
    const userId = user?.id ?? null
    if (userId === prevUserIdRef.current) return
    prevUserIdRef.current = userId
    syncActiveRef.current = false
    if (!userId) return

    let cancelled = false
    pullState(userId).then((remote) => {
      if (cancelled) return
      if (remote) {
        setRemoteConflict(remote)
      } else {
        syncActiveRef.current = true
        pushState(userId, stateRef.current)
        toast.show('Synced! This device is now the starting point. 🌱')
      }
    })
    return () => {
      cancelled = true
    }
  }, [user, toast])

  // Debounced push on every change, once sync is active for this session.
  useEffect(() => {
    if (!user || !syncActiveRef.current) return
    if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current)
    pushTimeoutRef.current = setTimeout(() => {
      pushState(user.id, state)
    }, PUSH_DEBOUNCE_MS)
    return () => {
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current)
    }
  }, [state, user])

  function useThisDevice() {
    if (!user) return
    syncActiveRef.current = true
    pushState(user.id, state)
    setRemoteConflict(null)
    toast.show("Using this device's data — synced. 🌱")
  }

  function useSyncedData() {
    if (!remoteConflict || !user) return
    dispatch({ type: 'REPLACE_STATE', state: remoteConflict })
    syncActiveRef.current = true
    setRemoteConflict(null)
    toast.show('Synced data loaded. 🌱')
  }

  if (!remoteConflict) return null

  return (
    <Modal onClose={() => {}}>
      <h2 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">Found synced data</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        This account already has Kaya data saved from another device. Which one do you want to keep?
      </p>
      <div className="grid gap-2">
        <button type="button" onClick={useSyncedData} className="min-h-11 rounded-full bg-focus font-semibold text-white">
          Use synced data
        </button>
        <button
          type="button"
          onClick={useThisDevice}
          className="min-h-11 rounded-full border border-slate-200 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
        >
          Use this device's data
        </button>
      </div>
    </Modal>
  )
}
