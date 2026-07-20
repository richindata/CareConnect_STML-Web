import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { RecoveryCodePanel } from '../components/RecoveryCodePanel'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { createAccount } from '../lib/auth'
import { isPlausibleEmail } from '../lib/validation'

const MIN_PASSWORD_LENGTH = 8

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function CreateAccountPage() {
  useDocumentTitle('Create account')
  const navigate = useNavigate()
  const { announce } = useAnnouncer()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [caringFor, setCaringFor] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)

  const clearError = (field: keyof FieldErrors) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    const next: FieldErrors = {}
    if (!fullName.trim()) next.fullName = 'Enter your name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!isPlausibleEmail(email)) next.email = 'That does not look like an email address.'
    if (!password) next.password = 'Choose a password.'
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    if (!confirmPassword) next.confirmPassword = 'Re-enter your password.'
    else if (confirmPassword !== password) next.confirmPassword = 'The two passwords do not match.'

    setErrors(next)
    const order: (keyof FieldErrors)[] = ['fullName', 'email', 'password', 'confirmPassword']
    const firstInvalid = order.find((field) => next[field])
    if (firstInvalid) {
      document.getElementById(`signup-${firstInvalid}`)?.focus()
      announce('There is a problem with the form.')
      return
    }

    setBusy(true)
    const result = await createAccount({
      fullName,
      email,
      password,
      caringFor,
    })
    setBusy(false)

    if (!result.ok) {
      setErrors({ email: 'An account with that email already exists. Try signing in instead.' })
      document.getElementById('signup-email')?.focus()
      announce('That email is already registered.')
      return
    }

    setRecoveryCode(result.recoveryCode)
    announce('Account created. Save your recovery code.')
  }

  if (recoveryCode) {
    return (
      <AuthShell title="Account created" tagline={`Welcome, ${fullName.trim().split(' ')[0]}.`}>
        <RecoveryCodePanel code={recoveryCode} heading="Your recovery code" />

        <button
          type="button"
          className="button auth__submit"
          onClick={() => navigate('/', { state: { justRegistered: true } })}
        >
          I have saved it — continue to sign in
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create account" tagline="Coordination for STML users and their caregivers">
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="signup-fullName">
            Full Name <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="signup-fullName"
            type="text"
            autoComplete="name"
            placeholder="Sarah Jenkins"
            required
            value={fullName}
            aria-invalid={errors.fullName ? 'true' : undefined}
            aria-describedby={errors.fullName ? 'signup-fullName-error' : undefined}
            onChange={(event) => {
              setFullName(event.target.value)
              clearError('fullName')
            }}
          />
          {errors.fullName ? (
            <p id="signup-fullName-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.fullName}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="signup-email">
            Email Address <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@email.com"
            required
            value={email}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'signup-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              clearError('email')
            }}
          />
          {errors.email ? (
            <p id="signup-email-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="signup-caringFor">Who are you caring for? (optional)</label>
          <input
            id="signup-caringFor"
            type="text"
            autoComplete="off"
            placeholder="Eleanor Jenkins"
            value={caringFor}
            aria-describedby="signup-caringFor-hint"
            onChange={(event) => setCaringFor(event.target.value)}
          />
          <p id="signup-caringFor-hint" className="field__hint">
            Shown on your dashboard so you know whose day you are looking at.
          </p>
        </div>

        <div className="field">
          <label htmlFor="signup-password">
            Password <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={
              errors.password ? 'signup-password-error signup-password-hint' : 'signup-password-hint'
            }
            onChange={(event) => {
              setPassword(event.target.value)
              clearError('password')
            }}
          />
          <p id="signup-password-hint" className="field__hint">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
          {errors.password ? (
            <p id="signup-password-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="signup-confirmPassword">
            Confirm Password <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="signup-confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            aria-invalid={errors.confirmPassword ? 'true' : undefined}
            aria-describedby={errors.confirmPassword ? 'signup-confirmPassword-error' : undefined}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              clearError('confirmPassword')
            }}
          />
          {errors.confirmPassword ? (
            <p id="signup-confirmPassword-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>

        <button type="submit" className="button auth__submit" aria-disabled={busy}>
          {busy ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <hr className="auth__divider" />

      <p className="auth__switch">
        Already have an account? <Link to="/">Sign in</Link>
      </p>
    </AuthShell>
  )
}
