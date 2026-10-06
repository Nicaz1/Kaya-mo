import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Screen } from '../types'

type NavigationContextValue = {
  screen: Screen
  navigate: (screen: Screen) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

/**
 * Lets any component jump screens (e.g. "Focus" on a task row should land on
 * the Focus tab with that task preloaded) without threading callbacks through
 * every layer.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('home')
  return <NavigationContext.Provider value={{ screen, navigate: setScreen }}>{children}</NavigationContext.Provider>
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
