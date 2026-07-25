import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ErrorState } from '../components/ErrorState'
import { SupportDialog } from '../components/SupportDialog'

/**
 * The 404 for signed-in users. It renders inside the app shell, so the masthead
 * and its responsive navigation stay available — a lost user can always get
 * back with one tap.
 */
export function NotFoundPage() {
  useDocumentTitle('Page not found')
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <div className="error-screen">
      <ErrorState
        title="404 — Page Not Found"
        message="The page you’re looking for doesn’t exist or has been moved. Nothing is lost — let’s get you back."
        footer={
          <button type="button" className="linklike" onClick={() => setSupportOpen(true)}>
            Need help?
          </button>
        }
      >
        <Link className="button" to="/dashboard">
          Go to Dashboard <span aria-hidden="true">→</span>
        </Link>
        <button type="button" className="button button--secondary" onClick={() => setSupportOpen(true)}>
          Contact Support
        </button>
      </ErrorState>

      <SupportDialog
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        defaultMessage={`I reached a "page not found" at ${window.location.pathname}.`}
      />
    </div>
  )
}
