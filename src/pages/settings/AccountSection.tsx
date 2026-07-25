import { useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { useAnnouncer } from '../../context/AnnouncerProvider'

interface FieldErrors {
  fullName?: string
  caringFor?: string
}

export function AccountSection() {
  const { user, updateProfile } = useAuth()
  const { announce } = useAnnouncer()

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [caringFor, setCaringFor] = useState(user?.caringFor ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saved, setSaved] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(false)

    const next: FieldErrors = {}
    if (!fullName.trim()) next.fullName = 'Enter your name.'
    if (!caringFor.trim()) next.caringFor = 'Enter who you are caring for.'

    setErrors(next)
    if (next.fullName || next.caringFor) {
      document.getElementById(next.fullName ? 'account-name' : 'account-caringFor')?.focus()
      announce('There is a problem with the form.')
      return
    }

    updateProfile({ fullName: fullName.trim(), caringFor: caringFor.trim() })
    setSaved(true)
    announce('Account details saved.')
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="account-heading">
      <header className="section-head">
        <h2 id="account-heading">Account</h2>
        <p>Your profile and who you are caring for.</p>
      </header>

      <div className="field">
        <label htmlFor="account-name">
          Your name <span className="req" aria-hidden="true">*</span>
        </label>
        <input
          id="account-name"
          type="text"
          autoComplete="name"
          value={fullName}
          aria-invalid={errors.fullName ? 'true' : undefined}
          aria-describedby={errors.fullName ? 'account-name-error' : undefined}
          onChange={(event) => {
            setFullName(event.target.value)
            setSaved(false)
            if (errors.fullName) setErrors((current) => ({ ...current, fullName: undefined }))
          }}
        />
        {errors.fullName ? (
          <p id="account-name-error" className="field__error">
            <span aria-hidden="true">⚠</span>
            {errors.fullName}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="account-email">Email</label>
        <input id="account-email" type="email" value={user?.email ?? ''} readOnly aria-describedby="account-email-hint" />
        <p id="account-email-hint" className="field__hint">
          Your sign-in email cannot be changed in this prototype.
        </p>
      </div>

      <div className="field">
        <label htmlFor="account-caringFor">
          Caring for <span className="req" aria-hidden="true">*</span>
        </label>
        <input
          id="account-caringFor"
          type="text"
          autoComplete="off"
          value={caringFor}
          aria-invalid={errors.caringFor ? 'true' : undefined}
          aria-describedby={errors.caringFor ? 'account-caringFor-error' : undefined}
          onChange={(event) => {
            setCaringFor(event.target.value)
            setSaved(false)
            if (errors.caringFor) setErrors((current) => ({ ...current, caringFor: undefined }))
          }}
        />
        {errors.caringFor ? (
          <p id="account-caringFor-error" className="field__error">
            <span aria-hidden="true">⚠</span>
            {errors.caringFor}
          </p>
        ) : null}
      </div>

      <div className="section-actions">
        <button type="submit" className="button">
          Save Changes
        </button>
        {saved ? (
          <span className="section-actions__saved" role="status">
            ✓ Saved
          </span>
        ) : null}
      </div>
    </form>
  )
}
