// Thin wrapper around localStorage so the rest of the app never touches it
// directly — swapping in a real backend later means changing only this file.

const PREFIX = 'kaya:'

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    // Corrupt JSON or storage unavailable (private browsing, quota) — treat as empty.
    return null
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage unavailable — app keeps working in-memory for this session.
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
