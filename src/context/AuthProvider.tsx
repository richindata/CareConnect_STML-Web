import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  clearSession,
  readSession,
  verifyCredentials,
  writeSession,
  type SessionUser,
  type SignInResult,
} from '../lib/auth'

interface AuthValue {
  user: SessionUser | null
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readSession())

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await verifyCredentials(email, password)
    if (result.ok) {
      writeSession(result.user)
      setUser(result.user)
    }
    return result
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthValue>(() => ({ user, signIn, signOut }), [user, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
