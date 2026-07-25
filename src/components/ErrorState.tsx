import type { ReactNode } from 'react'

interface ErrorStateProps {
  title: string
  message: string
  /** Action buttons (Go to dashboard, Try again, Contact support…). */
  children: ReactNode
  /** An optional footer slot, e.g. a "Need help?" affordance. */
  footer?: ReactNode
}

/**
 * The shared centred error layout — a calm, large, plain-language block used by
 * both the 404 page and the runtime error boundary. Kept presentational so it
 * works inside the app shell or as a standalone screen.
 */
export function ErrorState({ title, message, children, footer }: ErrorStateProps) {
  return (
    <div className="error-state">
      <span className="error-state__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="40" height="40" focusable="false">
          <path
            d="M24 9 L42 39 H6 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M24 20 V29" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="34" r="1.8" fill="currentColor" />
        </svg>
      </span>

      <h1 className="error-state__title">{title}</h1>
      <p className="error-state__message">{message}</p>

      <div className="error-state__actions">{children}</div>

      {footer ? <div className="error-state__footer">{footer}</div> : null}
    </div>
  )
}
