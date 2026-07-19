import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/**
 * Router-level error boundary. It renders its own landmarks because it can
 * replace the whole shell when the failure happens above the layout.
 */
export function ErrorPage() {
  const error = useRouteError()
  useDocumentTitle('Something went wrong')

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <main className="app-main" id="main-content">
      <h1>Something went wrong</h1>
      <p>
        CareConnect could not show that page. Your reminders and notes are safe — they are saved on
        this device.
      </p>

      <p className="button-row">
        <a className="button" href="/">
          Go back to Today
        </a>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </p>

      <details className="card">
        <summary>Technical details</summary>
        <p>
          <code>{detail}</code>
        </p>
      </details>
    </main>
  )
}
