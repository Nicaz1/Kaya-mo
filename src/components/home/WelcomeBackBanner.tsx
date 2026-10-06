import { useState } from 'react'
import { WELCOME_BACK_GAP_DAYS } from '../../game/streak'
import { getWelcomeBackGapAtLoad } from '../../state/store'

/** Shown once per session after a real absence — warm, not guilty, and the meters have already been reset. */
export function WelcomeBackBanner() {
  const [gap] = useState(() => getWelcomeBackGapAtLoad())
  const [dismissed, setDismissed] = useState(false)

  if (gap < WELCOME_BACK_GAP_DAYS || dismissed) return null

  return (
    <div className="w-full max-w-sm rounded-2xl bg-focus-soft p-4 text-center dark:bg-white/5">
      <p className="font-semibold text-focus">🌱 Welcome back!</p>
      <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
        It's been a few days. Meters are reset to a comfortable middle — let's ease back in.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-sm font-semibold text-focus underline-offset-2 hover:underline"
      >
        Got it
      </button>
    </div>
  )
}
