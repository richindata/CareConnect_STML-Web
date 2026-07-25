import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom ships crypto.getRandomValues but not crypto.subtle, which the account
// store needs for PBKDF2. Node's implementation is the real thing.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

// jsdom implements neither the modal behaviour of <dialog> nor matchMedia,
// so both are stubbed just enough for components under test to work.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}

// The route-change effect scrolls to the top; jsdom has no layout to scroll.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// jsdom has no layout engine, so matchMedia is faked against a settable viewport
// width. Tests default to desktop; `setViewportWidth(375)` exercises mobile.
let viewportWidth = 1440
const mediaListeners = new Set<() => void>()

function evaluate(query: string): boolean {
  const min = /min-width:\s*(\d+)px/.exec(query)
  if (min) return viewportWidth >= Number(min[1])
  const max = /max-width:\s*(\d+)px/.exec(query)
  if (max) return viewportWidth <= Number(max[1])
  return false
}

export function setViewportWidth(width: number): void {
  viewportWidth = width
  mediaListeners.forEach((notify) => notify())
}

window.matchMedia = vi.fn().mockImplementation((query: string) => {
  const list: Partial<MediaQueryList> & { matches: boolean } = {
    matches: evaluate(query),
    media: query,
    onchange: null,
    dispatchEvent: () => true,
  }
  const handlers = new Set<(event: MediaQueryListEvent) => void>()
  const notify = () => {
    list.matches = evaluate(query)
    handlers.forEach((handler) => handler({ matches: list.matches } as MediaQueryListEvent))
  }
  list.addEventListener = (_type: string, handler: EventListenerOrEventListenerObject) => {
    handlers.add(handler as (event: MediaQueryListEvent) => void)
    mediaListeners.add(notify)
  }
  list.removeEventListener = (_type: string, handler: EventListenerOrEventListenerObject) => {
    handlers.delete(handler as (event: MediaQueryListEvent) => void)
    if (handlers.size === 0) mediaListeners.delete(notify)
  }
  return list as MediaQueryList
})

afterEach(() => setViewportWidth(1440))
