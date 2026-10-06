import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { lowestMeter, moodForMeter } from '../../game/meters'
import type { Meters } from '../../types'

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
  const lowest = lowestMeter(meters)
  const mood = moodForMeter(meters[lowest])

  return (
    <motion.div
      className="mx-auto h-40 w-40"
      animate={reducedMotion || sleeping ? undefined : { y: [0, -8, 0] }}
      transition={reducedMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 160 160"
        className="h-full w-full"
        role="img"
        aria-label={sleeping ? 'Kaya is sleeping' : working ? 'Kaya is working alongside you' : `Kaya is feeling ${mood}`}
      >
        <ellipse cx="80" cy="94" rx="64" ry="56" fill={sleeping ? BODY_COLOR.droopy : BODY_COLOR[mood]} />

        {sleeping ? (
          <>
            <path d="M56 88 q8 -6 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M88 88 q8 -6 16 0" stroke="#1E1B2E" strokeWidth="4" fill="none" strokeLinecap="round" />
            <text x="112" y="70" fontSize="18" fill="#1E1B2E" opacity="0.6">
              z
            </text>
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
    </motion.div>
  )
}
