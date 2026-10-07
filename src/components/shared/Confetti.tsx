import { motion } from 'framer-motion'

const PARTICLES = ['🎉', '✨', '🌟', '💫', '🎊']

/** A brief celebratory burst — mount only for ~1.2s, e.g. right when the pet levels up. */
export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-12 z-50 flex justify-center gap-4" aria-hidden="true">
      {PARTICLES.map((emoji, i) => (
        <motion.span
          key={i}
          className="text-2xl"
          initial={{ opacity: 0, y: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, -28, 8, 36], scale: [0.5, 1.2, 1, 0.8], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 1.1, delay: i * 0.05, ease: 'easeOut' }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}
