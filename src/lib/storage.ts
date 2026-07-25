/**
 * Defensive localStorage helpers. Reads never throw — a corrupt or missing
 * entry falls back to the caller's default — and writes are best-effort so a
 * disabled or full store degrades to in-memory state rather than crashing.
 */

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage is best-effort; in-memory state stays correct either way.
  }
}

/** Stable ids without pulling in a uuid dependency. */
export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
