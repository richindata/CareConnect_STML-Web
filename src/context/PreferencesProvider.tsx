import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readStored, writeStored } from '../lib/storage'
import type { Preferences } from '../lib/types'

const STORAGE_KEY = 'careconnect.preferences.v1'

const defaultPreferences: Preferences = {
  theme: 'system',
  textSize: 'default',
  contrast: 'default',
  reduceMotion: false,
}

interface PreferencesValue {
  preferences: Preferences
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  resetPreferences: () => void
}

const PreferencesContext = createContext<PreferencesValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...defaultPreferences,
    ...readStored<Partial<Preferences>>(STORAGE_KEY, {}),
  }))

  // Preferences are applied as data-* attributes on <html> so plain CSS can
  // react to them without every component knowing about the settings.
  useEffect(() => {
    const root = document.documentElement
    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', preferences.theme)
    }
    root.setAttribute('data-text-size', preferences.textSize)
    root.setAttribute('data-contrast', preferences.contrast)
    root.setAttribute('data-motion', preferences.reduceMotion ? 'reduced' : 'full')
    writeStored(STORAGE_KEY, preferences)
  }, [preferences])

  const value = useMemo<PreferencesValue>(
    () => ({
      preferences,
      setPreference: (key, next) => setPreferences((current) => ({ ...current, [key]: next })),
      resetPreferences: () => setPreferences(defaultPreferences),
    }),
    [preferences],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>')
  return context
}
