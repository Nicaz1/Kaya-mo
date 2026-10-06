import { METER_META } from '../../data/meterMeta'
import type { MeterKind } from '../../types'

type MeterBarProps = {
  kind: MeterKind
  value: number
}

export function MeterBar({ kind, value }: MeterBarProps) {
  const meta = METER_META[kind]
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{meta.label}</span>
      <div
        className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${meta.label} meter`}
      >
        <div className={`h-full rounded-full ${meta.barClass} transition-[width] duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
