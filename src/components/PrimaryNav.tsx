import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useDismiss } from '../hooks/useDismiss'
import { useIsWideLayout } from '../hooks/useMediaQuery'

export const appNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/my-day', label: 'My Day' },
  { to: '/meds', label: 'Medications' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/mail', label: 'Mail' },
  { to: '/ai', label: 'Ask AI' },
  { to: '/settings', label: 'Settings' },
]

/**
 * The primary navigation, which transforms with the viewport:
 *   - tablet and desktop (>= 768px): a horizontal row of links
 *   - mobile (< 768px): a hamburger button that discloses the links as a panel
 *
 * The same links back both, so there is one source of truth and screen readers
 * never see duplicate navigation. The list is a real <ul> in a labelled <nav>.
 */
export function PrimaryNav() {
  const isWide = useIsWideLayout()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useDismiss(ref, open && !isWide, () => setOpen(false))

  // Close the panel after navigating, and whenever we grow into the wide layout.
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (isWide) setOpen(false)
  }, [isWide])

  const showList = isWide || open

  return (
    <nav className="primary-nav" aria-label="Primary" ref={ref}>
      {!isWide ? (
        <button
          type="button"
          className="primary-nav__toggle"
          aria-expanded={open}
          aria-controls="primary-nav-list"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="primary-nav__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Menu
        </button>
      ) : null}

      {showList ? (
        <ul
          id="primary-nav-list"
          className={`primary-nav__list ${isWide ? '' : 'primary-nav__list--panel'}`.trim()}
        >
          {appNavItems.map((item) => (
            <li key={item.to}>
              <NavLink className="primary-nav__link" to={item.to}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  )
}
