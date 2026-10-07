import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { getPettedLine } from '../../data/copy'
import { lowestMeter, moodForMeter } from '../../game/meters'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSound } from '../../hooks/useSound'
import type { Meters } from '../../types'

const CELEBRATE_DURATION_MS = 500
const PETTED_DURATION_MS = 900
const SPARKLES = ['✨', '💕', '✨']

const BODY_COLOR: Record<string, string> = {
  great: '#6FCBBB',
  okay: '#8FD3C7',
  low: '#B9E3DA',
  droopy: '#D3EDE7',
}

type PetProps = {
  meters: Meters
  /** Body-doubling mode for Focus sessions — Kaya works alongside you instead of idling. */
  working?: boolean
  /** Evening wind-down — Kaya's eyes close and it drifts off instead of bouncing. */
  sleeping?: boolean
}

export function Pet({ meters, working = false, sleeping = false }: PetProps) {
  const reducedMotion = useReducedMotion()
  const { play } = useSound()
  const lowest = lowestMeter(meters)
  const mood = moodForMeter(meters[lowest])

  // A little extra bounce right when a meter recovers — makes completions feel alive.
  const [celebrating, setCelebrating] = useState(false)
  const prevTotalRef = useRef(meters.focus + meters.body + meters.nest + meters.heart)

  useEffect(() => {
    const total = meters.focus + meters.body + meters.nest + meters.heart
    const grew = total > prevTotalRef.current + 1
    prevTotalRef.current = total
    if (!grew || reducedMotion) return
    setCelebrating(true)
    const timeout = setTimeout(() => setCelebrating(false), CELEBRATE_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [meters, reducedMotion])

  // Tap/click to pet — pure delight, never touches meters or XP.
  const [petted, setPetted] = useState(false)
  const [petCount, setPetCount] = useState(0)
  const [quip, setQuip] = useState(() => getPettedLine())
  const pettedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePet() {
    if (pettedTimeoutRef.current) clearTimeout(pettedTimeoutRef.current)
    setQuip(getPettedLine())
    setPetted(true)
    setPetCount((c) => c + 1)
    play('complete')
    pettedTimeoutRef.current = setTimeout(() => setPetted(false), PETTED_DURATION_MS)
  }

  useEffect(() => () => {
    if (pettedTimeoutRef.current) clearTimeout(pettedTimeoutRef.current)
  }, [])

  const showHappyFace = petted && !sleeping

  return (
    <div className="relative mx-auto h-40 w-40">
      <AnimatePresence>
        {petted && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-md dark:bg-kaya-dark dark:text-slate-200"
          >
            {quip}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {petted && !reducedMotion && (
          <motion.div key={petCount} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
            {SPARKLES.map((sparkle, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 text-lg"
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (i - 1) * 36,
                  y: -40 - i * 6,
                  scale: 1,
                }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
              >
                {sparkle}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={handlePet}
        aria-label={sleeping ? 'Kaya is sleeping' : working ? 'Kaya is working alongside you' : `Pet Kaya — currently feeling ${mood}`}
        className="h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        animate={
          reducedMotion || sleeping
            ? undefined
            : celebrating || petted
              ? { y: [0, -14, 0], scale: [1, 1.12, 1] }
              : { y: [0, -8, 0] }
        }
        transition={
          reducedMotion
            ? undefined
            : celebrating || petted
              ? { duration: CELEBRATE_DURATION_MS / 1000, ease: 'easeOut' }
              : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg viewBox="0 0 160 160" className="h-full w-full" aria-hidden="true">
          <ellipse cx="80" cy="94" rx="64" ry="56" fill={sleeping ? BODY_COLOR.droopy : BODY_COLOR[mood]} />

          {sleeping ? (
            <>
              <path d="M56 88 q8 -6 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M88 88 q8 -6 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
              <text x="112" y="70" fontSize="18" fill="#1E1B2E" opacity="0.6">
                z
              </text>
            </>
          ) : showHappyFace ? (
            <>
              <path d="M56 90 q8 -8 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M88 90 q8 -8 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : mood === 'droopy' ? (
            <>
              <path d="M56 88 q8 6 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M88 88 q8 6 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="64" cy="88" r="6" fill="#1E1B2E" />
              <circle cx="96" cy="88" r="6" fill="#1E1B2E" />
            </>
          )}

          <path
            d={
              sleeping
                ? 'M68 112 q12 4 24 0'
                : showHappyFace
                  ? 'M56 108 q24 24 48 0'
                  : mood === 'great'
                    ? 'M60 110 q20 20 40 0'
                    : mood === 'okay'
                      ? 'M62 110 q18 14 36 0'
                      : mood === 'low'
                        ? 'M64 112 q16 8 32 0'
                        : 'M66 114 q14 3 28 0'
            }
            stroke="#1E1B2E"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          {/* little antenna leaf, a nod to "Sprout" even under the Kaya name */}
          <path d="M60 46 q8 -16 24 -10" stroke="#4CC6B9" strokeWidth="6" fill="none" strokeLinecap="round" />

          {working && !sleeping && (
            <g>
              <rect x="52" y="130" width="56" height="8" rx="2" fill="#4CC6B9" />
              <rect x="60" y="120" width="40" height="12" rx="2" fill="#1E1B2E" />
            </g>
          )}
        </svg>
      </motion.button>
    </div>
  )
}
