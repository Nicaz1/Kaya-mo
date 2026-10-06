import { useState } from 'react'
import { daysGapSince } from '../../game/streak'
import { useAppDispatch, useAppState } from '../../state/store'
import type { EnergyLevel } from '../../types'
import { Modal } from '../shared/Modal'

const ENERGY_OPTIONS: { level: EnergyLevel; emoji: string; label: string }[] = [
  { level: 'low', emoji: '😴', label: 'Low' },
  { level: 'medium', emoji: '🙂', label: 'Okay' },
  { level: 'high', emoji: '⚡', label: 'High' },
]

const MAX_WINS = 3

/** The ≤60s morning check-in. Shown as a dismissable-by-ignoring card, never a forced modal. */
export function MorningCheckIn() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [energy, setEnergy] = useState<EnergyLevel>('medium')
  const [winDraft, setWinDraft] = useState('')
  const [wins, setWins] = useState<string[]>([])
  const [mustDo, setMustDo] = useState('')

  const doneToday = state.checkIn.lastMorningAt !== null && daysGapSince(state.checkIn.lastMorningAt, new Date()) === 0
  if (doneToday) return null

  function addWin() {
    const w = winDraft.trim()
    if (!w || wins.length >= MAX_WINS) return
    setWins((ws) => [...ws, w])
    setWinDraft('')
  }

  function submit() {
    dispatch({
      type: 'SET_MORNING_CHECKIN',
      energy,
      winsToday: wins,
      mustDoToday: mustDo.trim() || null,
      now: new Date().toISOString(),
    })
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full max-w-sm rounded-2xl border border-dashed border-focus/40 bg-focus-soft/40 p-4 text-left dark:bg-white/5"
      >
        <p className="font-semibold text-focus">☀️ Good morning! Quick check-in?</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Takes about 60 seconds.</p>
      </button>
    )
  }

  return (
    <Modal onClose={() => setOpen(false)}>
      <h2 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">Good morning ☀️</h2>

      <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">How's your energy?</p>
      <div className="mb-4 flex gap-2">
        {ENERGY_OPTIONS.map((opt) => (
          <button
            key={opt.level}
            type="button"
            onClick={() => setEnergy(opt.level)}
            aria-pressed={energy === opt.level}
            className={`min-h-14 flex-1 rounded-2xl border text-2xl ${
              energy === opt.level ? 'border-focus bg-focus-soft dark:bg-focus/20' : 'border-slate-200 dark:border-white/10'
            }`}
          >
            {opt.emoji}
          </button>
        ))}
      </div>

      <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Up to 3 things that would make today a win</p>
      {wins.length > 0 && (
        <ul className="mb-2 space-y-1">
          {wins.map((w, i) => (
            <li key={i} className="text-sm text-slate-600 dark:text-slate-300">
              • {w}
            </li>
          ))}
        </ul>
      )}
      {wins.length < MAX_WINS && (
        <input
          value={winDraft}
          onChange={(e) => setWinDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWin()}
          placeholder="Type one, press enter"
          className="mb-4 min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
        />
      )}

      <label className="mb-2 block text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="must-do">
        Any must-do work item today?
      </label>
      <input
        id="must-do"
        value={mustDo}
        onChange={(e) => setMustDo(e.target.value)}
        placeholder="Optional"
        className="mb-4 min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
      />

      <button type="button" onClick={submit} className="min-h-11 w-full rounded-full bg-focus font-semibold text-white">
        Start my day
      </button>
    </Modal>
  )
}
