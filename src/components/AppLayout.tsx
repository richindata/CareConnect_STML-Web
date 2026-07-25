import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { PwaStatus } from './PwaStatus'
import { PrimaryNav } from './PrimaryNav'
import { AccountMenu } from './AccountMenu'

/** The signed-in shell: masthead, primary navigation, account menu, <main>. */
export function AppLayout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  // Client-side navigation does not move focus the way a real page load does,
  // which strands keyboard and screen-reader users on the previous page.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
    window.scrollTo({ top: 0 })
  }, [location.pathname])

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

          <PrimaryNav />

          <AccountMenu />
        </div>
      </header>

      <main id="main-content" className="app__main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
