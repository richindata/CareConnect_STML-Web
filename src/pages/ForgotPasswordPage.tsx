import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { RecoveryCodePanel } from '../components/RecoveryCodePanel'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { resetPassword } from '../lib/auth'
import { isPlausibleEmail } from '../lib/validation'

const MIN_PASSWORD_LENGTH = 8

interface FieldErrors {
  email?: string
  recoveryCode?: string
  password?: string
  confirmPassword?: string
}

export function ForgotPasswordPage() {
  useDocumentTitle('Reset password')
  const navigate = useNavigate()
  const { announce } = useAnnouncer()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [busy, setBusy] = useState(false)
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null)

  const clearError = (field: keyof FieldErrors) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    const next: FieldErrors = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!isPlausibleEmail(email)) next.email = 'That does not look like an email address.'
    if (!code.trim()) next.recoveryCode = 'Enter the recovery code you saved.'
    if (!password) next.password = 'Choose a new password.'
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    if (confirmPassword !== password) next.confirmPassword = 'The two passwords do not match.'

    setErrors(next)
    const order: (keyof FieldErrors)[] = ['email', 'recoveryCode', 'password', 'confirmPassword']
    const firstInvalid = order.find((field) => next[field])
    if (firstInvalid) {
      document.getElementById(`reset-${firstInvalid}`)?.focus()
      announce('There is a problem with the form.')
      return
    }

    setBusy(true)
    const result = await resetPassword(email, code, password)
    setBusy(false)

    if (!result.ok) {
      // One combined message: revealing which half was wrong would confirm
      // whether an email is registered.
      setErrors({ recoveryCode: 'That email and recovery code do not match an account.' })
      document.getElementById('reset-recoveryCode')?.focus()
      announce('The email and recovery code do not match an account.')
      return
    }

    setNewRecoveryCode(result.recoveryCode)
    announce('Password changed. Save your new recovery code.')
  }

  if (newRecoveryCode) {
    return (
      <AuthShell title="Password changed" tagline="You can now sign in with your new password.">
        <RecoveryCodePanel code={newRecoveryCode} heading="Your new recovery code" />
        <p className="field__hint">The code you just used has been retired.</p>

        <button type="button" className="button auth__submit" onClick={() => navigate('/')}>
          I have saved it — continue to sign in
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset password"
      tagline="Use the recovery code you saved when you created your account."
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="reset-email">
            Email Address <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="reset-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@email.com"
            required
            value={email}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'reset-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              clearError('email')
            }}
          />
          {errors.email ? (
            <p id="reset-email-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reset-recoveryCode">
            Recovery Code <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="reset-recoveryCode"
            type="text"
            autoComplete="one-time-code"
            placeholder="ABCD-EFGH-JKLM"
            spellCheck={false}
            required
            value={code}
            aria-invalid={errors.recoveryCode ? 'true' : undefined}
            aria-describedby={
              errors.recoveryCode ? 'reset-recoveryCode-error reset-code-hint' : 'reset-code-hint'
            }
            onChange={(event) => {
              setCode(event.target.value)
              clearError('recoveryCode')
            }}
          />
          <p id="reset-code-hint" className="field__hint">
            Dashes and capitals do not matter.
          </p>
          {errors.recoveryCode ? (
            <p id="reset-recoveryCode-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.recoveryCode}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reset-password">
            New Password <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={
              errors.password ? 'reset-password-error reset-password-hint' : 'reset-password-hint'
            }
            onChange={(event) => {
              setPassword(event.target.value)
              clearError('password')
            }}
          />
          <p id="reset-password-hint" className="field__hint">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
          {errors.password ? (
            <p id="reset-password-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reset-confirmPassword">
            Confirm New Password <span className="auth__required" aria-hidden="true">*</span>
          </label>
          <input
            id="reset-confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            aria-invalid={errors.confirmPassword ? 'true' : undefined}
            aria-describedby={errors.confirmPassword ? 'reset-confirmPassword-error' : undefined}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              clearError('confirmPassword')
            }}
          />
          {errors.confirmPassword ? (
            <p id="reset-confirmPassword-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>

        <button type="submit" className="button auth__submit" aria-disabled={busy}>
          {busy ? 'Changing password…' : 'Change Password'}
        </button>
      </form>

      <hr className="auth__divider" />

      <p className="auth__switch">
        Remembered it? <Link to="/">Back to sign in</Link>
      </p>
    </AuthShell>
  )
}
