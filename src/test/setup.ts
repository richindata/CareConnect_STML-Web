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

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
