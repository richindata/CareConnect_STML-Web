import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PwaStatus } from './PwaStatus'
import { useAuth } from '../context/AuthProvider'
import { initialsOf } from '../lib/dashboardData'

export const appNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/my-day', label: 'My Day' },
  { to: '/meds', label: 'Meds' },
  { to: '/mail', label: 'Mail' },
  { to: '/ai', label: 'AI' },
  { to: '/settings', label: 'Settings' },
]

/** The signed-in shell: masthead, primary navigation, account menu, <main>. */
export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)
  const [menuOpen, setMenuOpen] = useState(false)

  // Client-side navigation does not move focus the way a real page load does,
  // which strands keyboard and screen-reader users on the previous page.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
    setMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = () => {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <PwaStatus />

      <header className="masthead">
        <div className="masthead__inner">
          <NavLink className="masthead__brand" to="/dashboard">
            <span className="masthead__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" focusable="false">
                <path
                  d="M12 20.3s-7.5-4.7-7.5-9.8A4.5 4.5 0 0 1 12 7.4a4.5 4.5 0 0 1 7.5 3.1c0 5.1-7.5 9.8-7.5 9.8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            CareConnect
          </NavLink>

          <nav className="masthead__nav" aria-label="Primary">
            <ul className="masthead__list">
              {appNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink className="masthead__link" to={item.to}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="account">
            <button
              type="button"
              className="account__trigger"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="account__avatar" aria-hidden="true">
                {initialsOf(user?.fullName ?? '?')}
              </span>
              <span className="account__text">
                <span className="account__name">{user?.fullName ?? 'Account'}</span>
                <span className="account__role">Primary</span>
              </span>
            </button>

            {menuOpen ? (
              <div className="account__menu">
                <p className="account__email">{user?.email}</p>
                <button type="button" className="button button--secondary" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main id="main-content" className="app__main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
