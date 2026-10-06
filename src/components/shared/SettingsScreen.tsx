import { useState } from 'react'
import { RECURRING_META, RECURRING_ORDER } from '../../data/recurringMeta'
import { totalDaysCared } from '../../game/streak'
import { useNotifications } from '../../hooks/useNotifications'
import { exportStateToJSON, importStateFromJSON } from '../../storage/exportImport'
import { migrate } from '../../storage/schema'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import type { RecurringKey, Settings } from '../../types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export function SettingsScreen() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const notifications = useNotifications()
  const [newDopamineItem, setNewDopamineItem] = useState('')

  function updateSettings(patch: Partial<Settings>) {
    dispatch({ type: 'UPDATE_SETTINGS', settings: patch })
  }

  async function toggleNotifications() {
    if (!state.settings.notificationsEnabled) {
      const result = await notifications.requestPermission()
      if (result !== 'granted') {
        toast.show('Notifications need permission from your browser to turn on.')
        return
      }
    }
    updateSettings({ notificationsEnabled: !state.settings.notificationsEnabled })
  }

  function addDopamineItem() {
    const v = newDopamineItem.trim()
    if (!v) return
    dispatch({ type: 'SET_DOPAMINE_MENU', items: [...state.dopamineMenu, v] })
    setNewDopamineItem('')
  }

  function removeDopamineItem(item: string) {
    dispatch({ type: 'SET_DOPAMINE_MENU', items: state.dopamineMenu.filter((i) => i !== item) })
  }

  function handleExport() {
    const json = exportStateToJSON(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaya-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.show('Exported! Check your downloads.')
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = importStateFromJSON(String(reader.result))
      if (parsed) {
        dispatch({ type: 'REPLACE_STATE', state: migrate(parsed) })
        toast.show('Data imported! 🎉')
      } else {
        toast.show("That file didn't look right — nothing changed.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="px-4 pb-24 pt-8">
      <h1 className="mb-4 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>

      <div className="mx-auto max-w-sm space-y-4">
        {/* Your journey */}
        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total days cared for Kaya</p>
          <p className="text-2xl font-bold text-focus">{totalDaysCared(state.daysCared)}</p>
        </section>

        {/* Sound & theme */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Sound</span>
            <button
              type="button"
              onClick={() => updateSettings({ soundOn: !state.settings.soundOn })}
              aria-pressed={state.settings.soundOn}
              className={`min-h-9 min-w-16 rounded-full px-3 text-sm font-semibold ${
                state.settings.soundOn ? 'bg-focus text-white' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
              }`}
            >
              {state.settings.soundOn ? 'On' : 'Off'}
            </button>
          </div>

          <div>
            <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">Theme</p>
            <div className="flex gap-2">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateSettings({ theme: t })}
                  aria-pressed={state.settings.theme === t}
                  className={`min-h-9 flex-1 rounded-full border text-sm font-semibold capitalize ${
                    state.settings.theme === t
                      ? 'border-focus bg-focus text-white'
                      : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Notifications</span>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-pressed={state.settings.notificationsEnabled}
              className={`min-h-9 min-w-16 rounded-full px-3 text-sm font-semibold ${
                state.settings.notificationsEnabled ? 'bg-focus text-white' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
              }`}
            >
              {state.settings.notificationsEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="quiet-start" className="text-slate-500 dark:text-slate-400">
              Quiet hours
            </label>
            <select
              id="quiet-start"
              value={state.settings.quietHoursStart}
              onChange={(e) => updateSettings({ quietHoursStart: Number(e.target.value) })}
              className="min-h-9 rounded-full border border-slate-200 bg-transparent px-2 dark:border-white/10 dark:text-white"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
            <span className="text-slate-400">to</span>
            <select
              id="quiet-end"
              value={state.settings.quietHoursEnd}
              onChange={(e) => updateSettings({ quietHoursEnd: Number(e.target.value) })}
              className="min-h-9 rounded-full border border-slate-200 bg-transparent px-2 dark:border-white/10 dark:text-white"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label htmlFor="max-nudges" className="text-slate-500 dark:text-slate-400">
              Max nudges per hour
            </label>
            <select
              id="max-nudges"
              value={state.settings.maxNudgesPerHour}
              onChange={(e) => updateSettings({ maxNudgesPerHour: Number(e.target.value) })}
              className="min-h-9 rounded-full border border-slate-200 bg-transparent px-2 dark:border-white/10 dark:text-white"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Recurring self-care */}
        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <p className="mb-3 font-semibold text-slate-700 dark:text-slate-200">Recurring self-care</p>
          <div className="space-y-2">
            {RECURRING_ORDER.map((key: RecurringKey) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {RECURRING_META[key].emoji} {RECURRING_META[key].label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateSettings({
                      recurringEnabled: { ...state.settings.recurringEnabled, [key]: !state.settings.recurringEnabled[key] },
                    })
                  }
                  aria-pressed={state.settings.recurringEnabled[key]}
                  className={`min-h-9 min-w-14 rounded-full px-3 text-xs font-semibold ${
                    state.settings.recurringEnabled[key]
                      ? 'bg-focus text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                  }`}
                >
                  {state.settings.recurringEnabled[key] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Dopamine menu */}
        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">Dopamine menu</p>
          <p className="mb-3 text-xs text-slate-400">Quick rewards Kaya suggests after a focus session or boss battle.</p>
          <ul className="mb-3 space-y-1">
            {state.dopamineMenu.map((item) => (
              <li key={item} className="flex items-center justify-between rounded-full bg-slate-50 px-3 py-1.5 text-sm dark:bg-white/5">
                <span className="text-slate-600 dark:text-slate-300">{item}</span>
                <button
                  type="button"
                  onClick={() => removeDopamineItem(item)}
                  aria-label={`Remove ${item}`}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={newDopamineItem}
              onChange={(e) => setNewDopamineItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDopamineItem()}
              placeholder="Add a reward"
              className="min-h-10 flex-1 rounded-full border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
            />
            <button type="button" onClick={addDopamineItem} className="min-h-10 rounded-full bg-focus px-4 text-sm font-semibold text-white">
              Add
            </button>
          </div>
        </section>

        {/* Data */}
        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <p className="mb-3 font-semibold text-slate-700 dark:text-slate-200">Your data</p>
          <div className="flex gap-2">
            <button type="button" onClick={handleExport} className="min-h-10 flex-1 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              Export JSON
            </button>
            <label className="min-h-10 flex-1 cursor-pointer rounded-full border border-slate-200 text-center text-sm font-semibold leading-10 text-slate-600 dark:border-white/10 dark:text-slate-300">
              Import JSON
              <input type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
