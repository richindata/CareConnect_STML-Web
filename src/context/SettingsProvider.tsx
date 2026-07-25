import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readStored, writeStored } from '../lib/storage'
import { defaultSettings, type SettingsState } from '../lib/settings'

const STORAGE_KEY = 'careconnect.settings.v1'

interface SettingsValue {
  settings: SettingsState
  /** Replaces one section wholesale — used by the section "Save" actions. */
  saveSection: <K extends keyof SettingsState>(section: K, value: SettingsState[K]) => void
}

const SettingsContext = createContext<SettingsValue | null>(null)

function loadInitial(): SettingsState {
  const stored = readStored<Partial<SettingsState>>(STORAGE_KEY, {})
  return {
    notifications: { ...defaultSettings.notifications, ...stored.notifications },
    privacy: { ...defaultSettings.privacy, ...stored.privacy },
    accessibility: { ...defaultSettings.accessibility, ...stored.accessibility },
    care: { ...defaultSettings.care, ...stored.care },
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(loadInitial)

  useEffect(() => {
    writeStored(STORAGE_KEY, settings)
  }, [settings])

  // Accessibility preferences are reflected as data-* attributes on <html> so
  // plain CSS can react to them app-wide.
  useEffect(() => {
    const root = document.documentElement
    const { reduceMotion, largeText, highContrast } = settings.accessibility
    root.setAttribute('data-motion', reduceMotion ? 'reduced' : 'full')
    root.setAttribute('data-text-size', largeText ? 'large' : 'default')
    root.setAttribute('data-contrast', highContrast ? 'high' : 'default')
  }, [settings.accessibility])

  const value = useMemo<SettingsValue>(
    () => ({
      settings,
      saveSection: (section, sectionValue) =>
        setSettings((current) => ({ ...current, [section]: sectionValue })),
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>')
  return context
}
