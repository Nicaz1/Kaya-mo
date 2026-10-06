import { EveningWindDown } from '../checkin/EveningWindDown'
import { MorningCheckIn } from '../checkin/MorningCheckIn'
import { getPetLine } from '../../data/copy'
import { METER_ORDER } from '../../data/meterMeta'
import { useAppState } from '../../state/store'
import { MeterBar } from '../meters/MeterBar'
import { Pet } from '../pet/Pet'
import { XpBar } from '../pet/XpBar'
import { NextTaskCard } from './NextTaskCard'
import { SelfCareRow } from './SelfCareRow'
import { WelcomeBackBanner } from './WelcomeBackBanner'

export function HomeScreen() {
  const state = useAppState()

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-10">
      <h1 className="text-2xl font-bold text-focus">Kaya</h1>

      <WelcomeBackBanner />

      <Pet meters={state.meters} />

      <XpBar level={state.pet.level} xp={state.pet.xp} />

      <p className="max-w-xs text-center text-slate-600 dark:text-slate-300">{getPetLine(state.meters)}</p>

      <div className="w-full max-w-sm space-y-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
        {METER_ORDER.map((kind) => (
          <MeterBar key={kind} kind={kind} value={state.meters[kind]} />
        ))}
      </div>

      <MorningCheckIn />

      <NextTaskCard />

      <SelfCareRow />

      <EveningWindDown />
    </div>
  )
}
