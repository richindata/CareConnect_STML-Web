import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from './Dialog'
import { navItems } from '../lib/navigation'
import { useAnnouncer } from '../context/AnnouncerProvider'

/** True when the keystroke belongs to whatever the user is typing into. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * Global shortcuts, layered on top of (never replacing) normal Tab navigation:
 *   ?      open this help
 *   g then t/r/d/p/n/s   jump to a section
 *   /      focus the search box on pages that have one
 * Shortcuts are ignored while typing and whenever a modifier is held, so they
 * never shadow browser or assistive-technology commands.
 */
export function KeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false)
  const navigate = useNavigate()
  const { announce } = useAnnouncer()
  const awaitingJumpRef = useRef(false)
  const jumpTimerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (awaitingJumpRef.current) {
        awaitingJumpRef.current = false
        window.clearTimeout(jumpTimerRef.current)
        const match = navItems.find((item) => item.shortcut === key)
        if (match) {
          event.preventDefault()
          navigate(match.to)
        }
        return
      }

      if (key === 'g') {
        awaitingJumpRef.current = true
        // The prefix expires so a stray "g" cannot swallow the next keystroke.
        jumpTimerRef.current = window.setTimeout(() => {
          awaitingJumpRef.current = false
        }, 1500)
        return
      }

      if (event.key === '?') {
        event.preventDefault()
        setHelpOpen(true)
        return
      }

      if (event.key === '/') {
        const search = document.querySelector<HTMLInputElement>('[data-search-input]')
        if (search) {
          event.preventDefault()
          search.focus()
          announce('Search box focused')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(jumpTimerRef.current)
    }
  }, [navigate, announce])

  return (
    <Dialog
      open={helpOpen}
      title="Keyboard shortcuts"
      description="Everything in CareConnect also works with Tab, Shift + Tab, and Enter."
      onClose={() => setHelpOpen(false)}
      footer={
        <button type="button" className="button" onClick={() => setHelpOpen(false)}>
          Close
        </button>
      }
    >
      <table className="shortcut-table">
        <caption className="visually-hidden">Keyboard shortcuts available on every page</caption>
        <thead>
          <tr>
            <th scope="col">Keys</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>
            </td>
            <td>Move forward and back through every control</td>
          </tr>
          <tr>
            <td>
              <kbd>Enter</kbd> / <kbd>Space</kbd>
            </td>
            <td>Activate the focused link, button, or checkbox</td>
          </tr>
          <tr>
            <td>
              <kbd>Esc</kbd>
            </td>
            <td>Close the open dialog</td>
          </tr>
          {navItems.map((item) => (
            <tr key={item.to}>
              <td>
                <kbd>g</kbd> then <kbd>{item.shortcut}</kbd>
              </td>
              <td>Go to {item.label}</td>
            </tr>
          ))}
          <tr>
            <td>
              <kbd>/</kbd>
            </td>
            <td>Jump to the search box, where a page has one</td>
          </tr>
          <tr>
            <td>
              <kbd>?</kbd>
            </td>
            <td>Open this list of shortcuts</td>
          </tr>
        </tbody>
      </table>
    </Dialog>
  )
}
