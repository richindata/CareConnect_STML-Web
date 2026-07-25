import { useState } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ErrorState } from '../components/ErrorState'
import { SupportDialog } from '../components/SupportDialog'

/**
 * Router-level error boundary for thrown/runtime failures. It renders as a
 * standalone screen (its own <main>), because the error may have broken the
 * app shell above it. Uses plain <a> for navigation so it works even if the
 * router itself is the thing that failed.
 */
export function ErrorPage() {
  const error = useRouteError()
  useDocumentTitle('Something went wrong')
  const [supportOpen, setSupportOpen] = useState(false)

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <main className="error-screen error-screen--standalone" id="main-content">
      <ErrorState
        title="Something went wrong"
        message="CareConnect ran into a problem showing that page. Your information is safe — it is saved on this device."
        footer={
          <details className="error-state__details">
            <summary>Technical details</summary>
            <p>
              <code>{detail}</code>
            </p>
          </details>
        }
      >
        <button type="button" className="button" onClick={() => window.location.reload()}>
          Try again
        </button>
        <a className="button button--secondary" href="/dashboard">
          Go to Dashboard
        </a>
        <button type="button" className="button button--secondary" onClick={() => setSupportOpen(true)}>
          Contact Support
        </button>
      </ErrorState>

      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        defaultMessage={`I saw an error: ${detail}`}
      />
    </main>
  )
}
