import { useEffect } from 'react'
import type { Settings } from '../types'

/** Applies the user's theme choice to the document root, resolving 'system' via the OS preference. */
export function useThemeSync(theme: Settings['theme']) {
  useEffect(() => {
    const root = document.documentElement

    function apply(isDark: boolean) {
      root.classList.toggle('dark', isDark)
      root.dataset.theme = isDark ? 'dark' : 'light'
    }

    if (theme === 'dark') {
      apply(true)
      return
    }
    if (theme === 'light') {
      apply(false)
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => apply(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
}
