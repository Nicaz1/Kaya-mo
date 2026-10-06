import type { AppState } from '../types'

export function exportStateToJSON(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

/** Returns null on invalid JSON or an obviously wrong shape; caller decides how to warn the user. */
export function importStateFromJSON(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json)
    if (parsed !== null && typeof parsed === 'object' && 'schemaVersion' in parsed) {
      return parsed as AppState
    }
    return null
  } catch {
    return null
  }
}
