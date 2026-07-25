import { Link, NavLink, Outlet } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { SETTINGS_SECTIONS } from '../lib/settings'

/**
 * Settings shell: a left-hand section nav and the active section in an Outlet.
 * The nav is a labelled set of NavLinks, so each section is a real, shareable
 * URL (`/settings/notifications`, …). It scrolls horizontally on mobile and
 * becomes a vertical rail from tablet up.
 */
export function SettingsPage() {
  useDocumentTitle('Settings')

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">Settings</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <ul>
            {SETTINGS_SECTIONS.map((section) => (
              <li key={section.path}>
                <NavLink className="settings-nav__link" to={section.path}>
                  {section.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="settings-content panel">
          <Outlet />
        </div>
      </div>
    </>
  )
}
