import { describe, expect, it, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { useDocumentTitle } from './useDocumentTitle'
import { useDraft } from './useDraft'
import { useDismiss } from './useDismiss'
import { useOnlineStatus } from './useOnlineStatus'
import { useMediaQuery, useIsWideLayout, BREAKPOINTS } from './useMediaQuery'
import { setViewportWidth } from '../test/setup'

describe('useDocumentTitle', () => {
  it('sets the bare brand title when given CareConnect', () => {
    renderHook(() => useDocumentTitle('CareConnect'))
    expect(document.title).toBe('CareConnect')
  })

  it('suffixes page titles with the brand', () => {
    renderHook(() => useDocumentTitle('Dashboard'))
    expect(document.title).toBe('Dashboard — CareConnect')
  })
})

describe('useDraft', () => {
  it('tracks dirty state and reset', () => {
    const { result, rerender } = renderHook(({ value }) => useDraft(value), {
      initialProps: { value: { name: 'Sarah' } },
    })

    expect(result.current.dirty).toBe(false)

    act(() => result.current.setDraft({ name: 'Michael' }))
    expect(result.current.draft.name).toBe('Michael')
    expect(result.current.dirty).toBe(true)

    act(() => result.current.reset())
    expect(result.current.draft.name).toBe('Sarah')
    expect(result.current.dirty).toBe(false)

    rerender({ value: { name: 'Jenny' } })
    expect(result.current.draft.name).toBe('Jenny')
  })
})

describe('useOnlineStatus', () => {
  it('reflects navigator.onLine and online/offline events', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    act(() => window.dispatchEvent(new Event('offline')))
    expect(result.current).toBe(false)

    act(() => window.dispatchEvent(new Event('online')))
    expect(result.current).toBe(true)
  })
})

describe('useMediaQuery / useIsWideLayout', () => {
  beforeEach(() => setViewportWidth(1440))

  it('matches desktop queries and updates when the viewport changes', async () => {
    const { result } = renderHook(() => useMediaQuery(BREAKPOINTS.tablet))
    expect(result.current).toBe(true)

    act(() => setViewportWidth(375))
    await waitFor(() => expect(result.current).toBe(false))
  })

  it('reports wide layout from the tablet breakpoint', async () => {
    const { result } = renderHook(() => useIsWideLayout())
    expect(result.current).toBe(true)
    act(() => setViewportWidth(500))
    await waitFor(() => expect(result.current).toBe(false))
  })
})

describe('useDismiss', () => {
  it('closes on Escape and outside pointerdown while open', () => {
    const onClose = vi.fn()

    function harness(open: boolean) {
      return renderHook(() => {
        const ref = useRef<HTMLDivElement | null>(document.createElement('div'))
        if (ref.current && !ref.current.isConnected) {
          document.body.appendChild(ref.current)
        }
        useDismiss(ref, open, onClose)
        return ref
      })
    }

    const { unmount } = harness(true)
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onClose).toHaveBeenCalledTimes(1)

    act(() => {
      document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    })
    expect(onClose).toHaveBeenCalledTimes(2)
    unmount()

    onClose.mockClear()
    harness(false)
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onClose).not.toHaveBeenCalled()
  })
})
