import { motion } from 'framer-motion'
import { useState } from 'react'
import { daysSinceContact, suggestedFriends } from '../../game/friends'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSound } from '../../hooks/useSound'
import { useAppDispatch, useAppState } from '../../state/store'
import { useToast } from '../../state/toast'
import type { FriendFrequency } from '../../types'

const FREQUENCY_LABEL: Record<FriendFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Every few months',
}

const FREQUENCIES: FriendFrequency[] = ['weekly', 'monthly', 'quarterly']

export function FriendsScreen() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { play } = useSound()
  const reducedMotion = useReducedMotion()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<FriendFrequency>('monthly')

  const now = new Date()
  const suggestions = suggestedFriends(state.friends, now)

  function addFriend() {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({
      type: 'ADD_FRIEND',
      friend: { id: crypto.randomUUID(), name: trimmed, frequency, lastContactedAt: null },
    })
    setName('')
    setFrequency('monthly')
    setAdding(false)
  }

  function logContact(friendId: string, verb: string) {
    dispatch({ type: 'LOG_CONTACT', friendId, now: new Date().toISOString() })
    toast.show(`Nice, you ${verb}! +15 Heart 🎉`)
    play('complete')
  }

  return (
    <div className="px-4 pb-24 pt-8">
      <h1 className="mb-1 text-center text-2xl font-bold text-slate-800 dark:text-slate-100">Friends</h1>
      <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">People you want to keep in touch with.</p>

      {suggestions.length > 0 && (
        <div className="mb-4 rounded-2xl bg-heart-soft p-4 dark:bg-white/5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-heart">Maybe reach out to</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{suggestions.slice(0, 3).map((f) => f.name).join(', ')}</p>
        </div>
      )}

      {state.friends.length === 0 && !adding && (
        <p className="mb-4 text-center text-slate-400">No one here yet — add a friend you want to keep in touch with.</p>
      )}

      <ul className="mb-4 space-y-2">
        {state.friends.map((friend) => {
          const days = daysSinceContact(friend, now)
          return (
            <li key={friend.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
              <div className="mb-3">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{friend.name}</p>
                <p className="text-xs text-slate-400">
                  {FREQUENCY_LABEL[friend.frequency]} ·{' '}
                  {days === null ? 'no contact logged yet' : `${days}d since last contact`}
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => logContact(friend.id, 'texted')}
                  whileTap={reducedMotion ? undefined : { scale: 0.92 }}
                  className="min-h-9 flex-1 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                >
                  Texted
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => logContact(friend.id, 'called')}
                  whileTap={reducedMotion ? undefined : { scale: 0.92 }}
                  className="min-h-9 flex-1 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                >
                  Called
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => logContact(friend.id, 'hung out')}
                  whileTap={reducedMotion ? undefined : { scale: 0.92 }}
                  className="min-h-9 flex-1 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                >
                  Hung out
                </motion.button>
              </div>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-white/5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
            placeholder="Friend's name"
            className="min-h-11 w-full rounded-full border border-slate-200 bg-transparent px-4 text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
          />
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                aria-pressed={frequency === f}
                className={`min-h-9 flex-1 rounded-full border text-xs font-semibold ${
                  frequency === f
                    ? 'border-heart bg-heart text-white'
                    : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'
                }`}
              >
                {FREQUENCY_LABEL[f]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={addFriend} className="min-h-11 flex-1 rounded-full bg-heart font-semibold text-white">
              Add friend
            </button>
            <button type="button" onClick={() => setAdding(false)} className="min-h-11 rounded-full px-4 text-slate-400">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="min-h-11 w-full rounded-full border border-slate-200 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
        >
          + Add a friend
        </button>
      )}
    </div>
  )
}
