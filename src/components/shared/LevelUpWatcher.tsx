import { useEffect, useRef } from 'react'
import { useSound } from '../../hooks/useSound'
import { useAppState } from '../../state/store'
import { useToast } from '../../state/toast'

/**
 * Mounted once, app-wide. Watches pet level across every source of XP (task
 * completion today, focus sessions / boss battles later) and celebrates loudly
 * whenever it goes up — the one reward moment that always deserves a toast.
 */
export function LevelUpWatcher() {
  const state = useAppState()
  const toast = useToast()
  const { play } = useSound()
  const prevLevelRef = useRef(state.pet.level)

  useEffect(() => {
    if (state.pet.level > prevLevelRef.current) {
      toast.show(`Level up! Kaya is now level ${state.pet.level} 🎉`)
      play('levelUp')
    }
    prevLevelRef.current = state.pet.level
  }, [state.pet.level, toast, play])

  return null
}
