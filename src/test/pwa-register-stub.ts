/**
 * Test double for `virtual:pwa-register/react`. The real module is supplied by
 * vite-plugin-pwa at build time and would try to register a service worker,
 * which jsdom has no implementation for.
 */
export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}] as [boolean, (value: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (value: boolean) => void],
    updateServiceWorker: async () => {},
  }
}
