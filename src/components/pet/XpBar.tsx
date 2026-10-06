import { xpIntoCurrentLevel } from '../../game/xp'

type XpBarProps = {
  level: number
  xp: number
}

export function XpBar({ level, xp }: XpBarProps) {
  const { current, needed } = xpIntoCurrentLevel(xp)
  const pct = needed === 0 ? 100 : Math.min(100, (current / needed) * 100)

  return (
    <div className="w-full max-w-[12rem]">
      <p className="mb-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Level {level}</p>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`XP progress toward level ${level + 1}`}
      >
        <div className="h-full rounded-full bg-amber-400 transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
