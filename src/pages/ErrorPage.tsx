import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** Router-level error boundary. It renders its own <main> landmark. */
export function ErrorPage() {
  const error = useRouteError()
  useDocumentTitle('Something went wrong')

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <main className="auth" id="main-content">
      <div className="auth__card">
        <h1 className="auth__title">Something went wrong</h1>
        <p className="auth__tagline">CareConnect could not show that page.</p>

        <button
          type="button"
          className="button auth__submit"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>

        <details className="auth__note">
          <summary>Technical details</summary>
          <p>
            <code>{detail}</code>
          </p>
        </details>
      </div>
    </main>
  )
}
