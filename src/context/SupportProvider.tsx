import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'

const STORAGE_KEY = 'careconnect.support.v1'

export interface SupportRequest {
  id: string
  email: string
  message: string
  at: string
}

interface SupportValue {
  requests: SupportRequest[]
  /** Records a support request locally (there is no server to send it to). */
  submitRequest: (email: string, message: string) => void
}

const SupportContext = createContext<SupportValue | null>(null)

export function SupportProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<SupportRequest[]>(
    () => readStored<SupportRequest[]>(STORAGE_KEY, []),
  )

  useEffect(() => {
    writeStored(STORAGE_KEY, requests)
  }, [requests])

  const submitRequest = useCallback((email: string, message: string) => {
    setRequests((current) => [
      { id: createId('sup'), email: email.trim(), message: message.trim(), at: new Date().toISOString() },
      ...current,
    ])
  }, [])

  const value = useMemo<SupportValue>(() => ({ requests, submitRequest }), [requests, submitRequest])

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>
}

export function useSupport(): SupportValue {
  const context = useContext(SupportContext)
  if (!context) throw new Error('useSupport must be used inside <SupportProvider>')
  return context
}
