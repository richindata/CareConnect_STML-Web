/**
 * Thin localStorage wrapper. Every read is defensive: a corrupt or missing
 * entry falls back to the caller's default rather than crashing the app, and
 * writes are skipped silently when storage is unavailable (private mode, quota
 * exceeded, storage disabled by policy).
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
    // Storage is best-effort; the in-memory state stays correct either way.
  }
}

export function clearStored(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

/** Stable ids without pulling in a uuid dependency. */
export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
