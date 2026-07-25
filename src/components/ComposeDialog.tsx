import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from './Dialog'
import { useMail } from '../context/MailProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'

interface ComposeDialogProps {
  open: boolean
  onClose: () => void
}

interface FieldErrors {
  recipient?: string
  message?: string
}

/** Starts a message to one of the existing contacts, then opens that thread. */
export function ComposeDialog({ open, onClose }: ComposeDialogProps) {
  const { conversations, sendMessage } = useMail()
  const { announce } = useAnnouncer()
  const navigate = useNavigate()

  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const close = () => {
    setRecipient('')
    setMessage('')
    setErrors({})
    onClose()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: FieldErrors = {}
    if (!recipient) next.recipient = 'Choose who to message.'
    if (!message.trim()) next.message = 'Type a message.'

    setErrors(next)
    if (next.recipient || next.message) {
      document.getElementById(next.recipient ? 'compose-recipient' : 'compose-message')?.focus()
      announce('There is a problem with the form.')
      return
    }

    sendMessage(recipient, message)
    announce('Message sent.')
    close()
    navigate(`/mail/${recipient}`)
  }

  return (
    <Dialog open={open} title="New message" description="Send a note to someone on the care team." onClose={close}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="compose-recipient">
            To <span className="req" aria-hidden="true">*</span>
          </label>
          <select
            id="compose-recipient"
            value={recipient}
            aria-invalid={errors.recipient ? 'true' : undefined}
            aria-describedby={errors.recipient ? 'compose-recipient-error' : undefined}
            onChange={(event) => {
              setRecipient(event.target.value)
              if (errors.recipient) setErrors((current) => ({ ...current, recipient: undefined }))
            }}
          >
            <option value="">Choose a recipient…</option>
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.name} — {conversation.role}
              </option>
            ))}
          </select>
          {errors.recipient ? (
            <p id="compose-recipient-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.recipient}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="compose-message">
            Message <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="compose-message"
            rows={4}
            value={message}
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? 'compose-message-error' : undefined}
            onChange={(event) => {
              setMessage(event.target.value)
              if (errors.message) setErrors((current) => ({ ...current, message: undefined }))
            }}
          />
          {errors.message ? (
            <p id="compose-message-error" className="field__error">
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
            Send
          </button>
        </div>
      </form>
    </Dialog>
  )
}
