import type { Screen } from '../../types'

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'quests', label: 'Quests', icon: '📋' },
  { id: 'focus', label: 'Focus', icon: '⏱️' },
  { id: 'friends', label: 'Friends', icon: '💛' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

type NavBarProps = {
  active: Screen
  onNavigate: (screen: Screen) => void
}

export function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-black/5 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10 dark:bg-kaya-dark/90"
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-16 min-w-16 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-semibold transition-colors ${
              isActive ? 'text-focus' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
