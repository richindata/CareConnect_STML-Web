import { Link, useLocation } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { appNavItems } from '../components/AppLayout'

/**
 * Stands in for the nav sections that exist in the design but have not been
 * built. Better an honest placeholder than a link that appears to work.
 */
export function SectionPlaceholderPage() {
  const location = useLocation()
  const item = appNavItems.find((entry) => entry.to === location.pathname)
  const label = item?.label ?? 'This section'

  useDocumentTitle(label)

  return (
    <>
      <header className="page-intro">
        <h1>{label}</h1>
        <p className="page-intro__meta">This section has not been built yet.</p>
      </header>

      <section className="panel">
        <p>
          The design includes {label}, but only the Dashboard is implemented so far. Nothing is
          missing from your account — there is simply no screen here yet.
        </p>
        <p className="panel__footer">
          <Link className="panel__action" to="/dashboard">
            <span aria-hidden="true">←</span> Back to Dashboard
          </Link>
        </p>
      </section>
    </>
  )
}
