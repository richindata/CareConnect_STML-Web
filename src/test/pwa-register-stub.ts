/**
 * Controllable test double for `virtual:pwa-register/react`.
 */
import { useState } from 'react'

type RegisterOptions = {
  onRegisteredSW?: (url: string) => void
  onRegisterError?: (error: unknown) => void
}

let initialNeedRefresh = false

export function __setNeedRefresh(value: boolean) {
  initialNeedRefresh = value
}

export function __resetPwaStub() {
  initialNeedRefresh = false
}

export function useRegisterSW(options: RegisterOptions = {}) {
  options.onRegisteredSW?.('/sw.js')
  const [needRefresh, setNeedRefresh] = useState(initialNeedRefresh)

  return {
    needRefresh: [needRefresh, setNeedRefresh] as [boolean, (value: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (value: boolean) => void],
    updateServiceWorker: async () => {},
  }
}
