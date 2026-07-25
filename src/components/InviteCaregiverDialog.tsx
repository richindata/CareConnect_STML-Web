import { useState } from 'react'
import { Dialog } from './Dialog'
import { useCareTeam } from '../context/CareTeamProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { CARE_ROLES } from '../lib/careTeam'
import { isPlausibleEmail } from '../lib/validation'

interface InviteCaregiverDialogProps {
  open: boolean
  onClose: () => void
}

interface FieldErrors {
  email?: string
  role?: string
}

export function InviteCaregiverDialog({ open, onClose }: InviteCaregiverDialogProps) {
  const { inviteCaregiver, invites } = useCareTeam()
  const { announce } = useAnnouncer()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>(CARE_ROLES[0])
  const [errors, setErrors] = useState<FieldErrors>({})

  const reset = () => {
    setEmail('')
    setRole(CARE_ROLES[0])
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: FieldErrors = {}
    if (!email.trim()) next.email = 'Enter the caregiver’s email address.'
    else if (!isPlausibleEmail(email)) next.email = 'That does not look like an email address.'
    if (!role) next.role = 'Choose a role.'

    setErrors(next)
    if (next.email || next.role) {
      document.getElementById(next.email ? 'invite-email' : 'invite-role')?.focus()
      announce('There is a problem with the form.')
      return
    }

    const alreadyInvited = invites.some(
      (invite) => invite.email === email.trim().toLowerCase(),
    )
    inviteCaregiver({ email, role })
    announce(
      alreadyInvited
        ? `Invitation to ${email.trim()} updated and resent.`
        : `Invitation sent to ${email.trim()} as ${role}.`,
    )
    close()
  }

  return (
    <Dialog
      open={open}
      title="Invite Caregiver"
      description="They will receive an invitation to join Eleanor’s care team."
      onClose={close}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="invite-email">
            Email Address <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="invite-email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="name@example.com"
            required
            value={email}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'invite-email-error' : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
            }}
          />
          {errors.email ? (
            <p id="invite-email-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="invite-role">
            Role <span className="req" aria-hidden="true">*</span>
          </label>
          <select
            id="invite-role"
            required
            value={role}
            aria-invalid={errors.role ? 'true' : undefined}
            aria-describedby={errors.role ? 'invite-role-error' : undefined}
            onChange={(event) => setRole(event.target.value)}
          >
            {CARE_ROLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.role ? (
            <p id="invite-role-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.role}
            </p>
          ) : null}
        </div>

        <div className="dialog__footer">
          <button type="button" className="button button--secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="button">
            Send Invitation
          </button>
        </div>
      </form>
    </Dialog>
  )
}
