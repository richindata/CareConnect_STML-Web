import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface AnnouncerValue {
  /** Sends a message to the polite live region so screen readers report it. */
  announce: (message: string) => void
}

const AnnouncerContext = createContext<AnnouncerValue | null>(null)

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<number | undefined>(undefined)

  const announce = useCallback((next: string) => {
    window.clearTimeout(timeoutRef.current)
    // Clearing first guarantees a DOM change even when the same text repeats,
    // which is what actually triggers the announcement.
    setMessage('')
    timeoutRef.current = window.setTimeout(() => setMessage(next), 60)
  }, [])

  const value = useMemo(() => ({ announce }), [announce])

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </AnnouncerContext.Provider>
  )
}

export function useAnnouncer(): AnnouncerValue {
  const context = useContext(AnnouncerContext)
  if (!context) throw new Error('useAnnouncer must be used inside <AnnouncerProvider>')
  return context
}
