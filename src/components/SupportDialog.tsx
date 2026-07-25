import { useState } from 'react'
import { Dialog } from './Dialog'
import { useSupport } from '../context/SupportProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { isPlausibleEmail } from '../lib/validation'

interface SupportDialogProps {
  open: boolean
  onClose: () => void
  /** Prefills the message, e.g. with the page that failed. */
  defaultMessage?: string
}

interface FieldErrors {
  email?: string
  message?: string
}

export function SupportDialog({ open, onClose, defaultMessage = '' }: SupportDialogProps) {
  const { submitRequest } = useSupport()
  const { announce } = useAnnouncer()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(defaultMessage)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [sent, setSent] = useState(false)

  const close = () => {
    setEmail('')
    setMessage(defaultMessage)
    setErrors({})
    setSent(false)
    onClose()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: FieldErrors = {}
    if (!email.trim()) next.email = 'Enter your email so we can reply.'
    else if (!isPlausibleEmail(email)) next.email = 'That does not look like an email address.'
    if (!message.trim()) next.message = 'Tell us what happened.'

    setErrors(next)
    if (next.email || next.message) {
      document.getElementById(next.email ? 'support-email' : 'support-message')?.focus()
      announce('There is a problem with the form.')
      return
    }

    submitRequest(email, message)
    setSent(true)
    announce('Your message has been saved.')
  }

  return (
    <Dialog
      open={open}
      title="Contact support"
      description="Tell us what went wrong and we’ll help."
      onClose={close}
    >
      {sent ? (
        <div className="support-sent" role="status">
          <p>
            <span aria-hidden="true">✓</span> Thanks — your message is saved on this device. In the
            full app it would reach the care team.
          </p>
          <div className="dialog__footer">
            <button type="button" className="button" onClick={close}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="support-email">
              Your email <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="support-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@email.com"
              required
              value={email}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'support-email-error' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
              }}
            />
            {errors.email ? (
              <p id="support-email-error" className="field__error">
                <span aria-hidden="true">⚠</span>
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="support-message">
              What happened? <span className="req" aria-hidden="true">*</span>
            </label>
            <textarea
              id="support-message"
              rows={4}
              value={message}
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={errors.message ? 'support-message-error' : undefined}
              onChange={(event) => {
                setMessage(event.target.value)
                if (errors.message) setErrors((current) => ({ ...current, message: undefined }))
              }}
            />
            {errors.message ? (
              <p id="support-message-error" className="field__error">
                <span aria-hidden="true">⚠</span>
                {errors.message}
              </p>
            ) : null}
          </div>

          <div className="dialog__footer">
            <button type="button" className="button button--secondary" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="button">
              Send message
            </button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
