import { useEffect, useState } from 'react'

/**
 * Subscribes to a CSS media query and re-renders when it changes.
 *
 * Reads the initial value synchronously so the first paint is already correct,
 * and falls back to `false` where `matchMedia` is unavailable (older test
 * environments, SSR).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const list = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    // Re-sync in case the query changed between render and effect.
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Shared breakpoints, mirrored in the CSS. Tablet and up gets the wide nav. */
export const BREAKPOINTS = {
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1440px)',
} as const

/** True from tablet width up — the point where the primary nav goes horizontal. */
export function useIsWideLayout(): boolean {
  return useMediaQuery(BREAKPOINTS.tablet)
}
