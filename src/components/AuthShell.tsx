import type { ReactNode } from 'react'
import { PwaStatus } from './PwaStatus'

interface AuthShellProps {
  title: string
  tagline: string
  children: ReactNode
}

/** The centred card used by every signed-out screen. */
export function AuthShell({ title, tagline, children }: AuthShellProps) {
  return (
    <main className="auth" id="main-content">
      <PwaStatus />

      <div className="auth__card">
        <header className="auth__header">
          <span className="auth__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
              <path
                d="M12 20.3s-7.5-4.7-7.5-9.8A4.5 4.5 0 0 1 12 7.4a4.5 4.5 0 0 1 7.5 3.1c0 5.1-7.5 9.8-7.5 9.8Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="auth__title">{title}</h1>
          <p className="auth__tagline">{tagline}</p>
        </header>

        {children}
      </div>
    </main>
  )
}
