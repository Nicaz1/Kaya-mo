import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSound } from '../../hooks/useSound'
import { useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import { Confetti } from './Confetti'

const CONFETTI_DURATION_MS = 1300

/**
 * Mounted once, app-wide. Watches pet level across every source of XP (task
 * completion today, focus sessions / boss battles later) and celebrates loudly
 * whenever it goes up — the one reward moment that always deserves a toast.
 */
export function LevelUpWatcher() {
  const state = useAppState()
  const toast = useToast()
  const { play } = useSound()
  const reducedMotion = useReducedMotion()
  const prevLevelRef = useRef(state.pet.level)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (state.pet.level > prevLevelRef.current) {
      toast.show(`Level up! Kaya is now level ${state.pet.level} 🎉`)
      play('levelUp')
      if (!reducedMotion) {
        setShowConfetti(true)
        const timeout = setTimeout(() => setShowConfetti(false), CONFETTI_DURATION_MS)
        prevLevelRef.current = state.pet.level
        return () => clearTimeout(timeout)
      }
    }
    prevLevelRef.current = state.pet.level
  }, [state.pet.level, toast, play, reducedMotion])

  return showConfetti ? <Confetti /> : null
}
