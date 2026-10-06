import { useState } from 'react'
import { categorizeTask } from '../../game/categorize'
import { useAppDispatch } from '../../state/store'

/** Always-visible "+" — type one line, hit enter, done. No required fields. */
export function QuickCapture() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  function submit() {
    const title = value.trim()
    if (title) {
      dispatch({
        type: 'ADD_TASK',
        task: {
          id: crypto.randomUUID(),
          title,
          meter: categorizeTask(title),
          dread: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          isRecurring: false,
        },
      })
    }
    setValue('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick capture a task"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-focus text-3xl font-bold text-white shadow-lg active:scale-95"
      >
        +
      </button>
    )
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-30 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-xl dark:bg-kaya-dark">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setOpen(false)
        }}
        onBlur={() => {
          if (!value.trim()) setOpen(false)
        }}
        placeholder="What's on your mind?"
        aria-label="Quick capture input"
        className="min-h-11 flex-1 rounded-full border border-slate-200 bg-transparent px-4 text-base text-slate-800 outline-none focus:border-focus dark:border-white/10 dark:text-white"
      />
      <button type="button" onClick={submit} className="min-h-11 rounded-full bg-focus px-4 font-semibold text-white">
        Add
      </button>
    </div>
  )
}
