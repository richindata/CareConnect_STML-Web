import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { useAuth } from '../context/AuthProvider'
import { isPlausibleEmail } from '../lib/validation'

interface FieldErrors {
  email?: string
  password?: string
}

export function SignInPage() {
  useDocumentTitle('Sign in')
  const navigate = useNavigate()
  const location = useLocation()
  const { announce } = useAnnouncer()
  const { signIn } = useAuth()

  const justRegistered = (location.state as { justRegistered?: boolean } | null)?.justRegistered
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    const next: FieldErrors = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!isPlausibleEmail(email)) next.email = 'That does not look like an email address.'
    if (!password) next.password = 'Enter your password.'

    setErrors(next)
    setFormError('')

    if (next.email || next.password) {
      document.getElementById(next.email ? 'signin-email' : 'signin-password')?.focus()
      announce('There is a problem with the form.')
      return
    }

    setBusy(true)
    const result = await signIn(email, password)
    setBusy(false)

    if (!result.ok) {
      // Deliberately does not say which of the two was wrong — that would
      // reveal whether an email is registered.
      setFormError('That email and password do not match an account.')
      document.getElementById('signin-password')?.focus()
      announce('That email and password do not match an account.')
      return
    }

    navigate(from && from !== '/' ? from : '/dashboard', { replace: true })
  }

  return (
    <AuthShell title="CareConnect" tagline="Coordination for STML users and their caregivers">
      {justRegistered ? (
        <p className="auth__confirmation" role="status">
          <span aria-hidden="true">✓</span> Your account is ready. Sign in to continue.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="field__error auth__form-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {formError}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="signin-email">
            Email Address <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@email.com"
            required
            value={email}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'signin-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
            }}
          />
          {errors.email ? (
            <p id="signin-email-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="signin-password">
            Password <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            value={password}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={errors.password ? 'signin-password-error' : undefined}
            onChange={(event) => {
              setPassword(event.target.value)
              if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
            }}
          />
          {errors.password ? (
            <p id="signin-password-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.password}
            </p>
          ) : null}
        </div>

        <button type="submit" className="button auth__submit" aria-disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="auth__forgot">
        <Link to="/forgot-password">Forgot password?</Link>
      </p>

      <hr className="auth__divider" />

      <p className="auth__switch">
        New here? <Link to="/create-account">Create account</Link>
      </p>

      <p className="auth__note">
        Prototype — accounts are stored only in this browser. Not real authentication.
      </p>
    </AuthShell>
  )
}
