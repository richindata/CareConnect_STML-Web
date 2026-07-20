/** Deliberately permissive: just enough to catch a typo, not a spec-perfect regex. */
export function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
