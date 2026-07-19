import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useAnnouncer } from '../context/AnnouncerProvider'

/** The install prompt event, which TypeScript's DOM lib does not model. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Surfaces the three PWA states a user can act on: a waiting update, offline
 * mode, and installability. Each is an ordinary banner in the document flow so
 * it is reachable by keyboard and announced rather than flashed and lost.
 */
export function PwaStatus() {
  const online = useOnlineStatus()
  const { announce } = useAnnouncer()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (url) => {
      if (import.meta.env.DEV) console.info('[pwa] service worker registered:', url)
    },
    onRegisterError: (error) => console.error('[pwa] registration failed', error),
  })

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Suppress the mini-infobar so we can offer install at a calmer moment.
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstallEvent(null)
      announce('CareConnect has been added to your device.')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [announce])

  // Announce connectivity changes, but not the initial state on page load.
  const previousOnlineRef = useRef(online)
  useEffect(() => {
    if (previousOnlineRef.current === online) return
    previousOnlineRef.current = online
    announce(
      online
        ? 'Back online.'
        : 'You are offline. CareConnect keeps working and saves everything on this device.',
    )
  }, [online, announce])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'dismissed') announce('Install cancelled.')
    setInstallEvent(null)
  }

  return (
    <>
      {!online ? (
        <p className="pwa-bar">
          <span aria-hidden="true">📴</span>
          You are offline — everything here still works and is saved on this device.
        </p>
      ) : null}

      {needRefresh ? (
        <div className="pwa-bar pwa-bar--update">
          <span>A newer version of CareConnect is ready.</span>
          <button type="button" className="button" onClick={() => updateServiceWorker(true)}>
            Reload now
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setNeedRefresh(false)}
          >
            Later
          </button>
        </div>
      ) : null}

      {installEvent ? (
        <div className="pwa-bar">
          <span>Add CareConnect to your device so it opens like an app.</span>
          <button type="button" className="button" onClick={handleInstall}>
            Add to device
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setInstallEvent(null)}
          >
            Not now
          </button>
        </div>
      ) : null}
    </>
  )
}
