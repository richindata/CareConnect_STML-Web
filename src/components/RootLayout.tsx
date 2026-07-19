import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { navItems } from '../lib/navigation'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { PwaStatus } from './PwaStatus'

/**
 * The application shell: one <header> with the primary <nav>, one <main>, one
 * <footer>. Landmarks are unique and labelled so screen-reader users can jump
 * straight to a region.
 */
export function RootLayout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  // A client-side route change does not move focus or reset scroll the way a
  // real navigation does, which strands keyboard and screen-reader users at
  // the bottom of the previous page. Moving focus to <main> restores both.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-header">
        <PwaStatus />

        <div className="app-header__bar">
          <NavLink className="brand" to="/">
            <img src="/icons/icon-192.png" alt="" width={32} height={32} />
            CareConnect
          </NavLink>

          <nav className="primary-nav" aria-label="Primary">
            <ul className="primary-nav__list">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink className="nav-link" to={item.to} end={item.end}>
                    <span className="nav-link__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="app-main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>
          CareConnect — a coursework prototype for SWEN 661. Not a medical device. Press{' '}
          <kbd>?</kbd> for keyboard shortcuts.
        </p>
      </footer>

      <KeyboardShortcuts />
    </div>
  )
}
