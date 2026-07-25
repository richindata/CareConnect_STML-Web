import { useState } from 'react'
import { useSettings } from '../../context/SettingsProvider'
import { useAnnouncer } from '../../context/AnnouncerProvider'
import { useDraft } from '../../hooks/useDraft'
import { REMINDER_LEAD_OPTIONS, isPlausiblePhone } from '../../lib/settings'

export function CarePreferencesSection() {
  const { settings, saveSection } = useSettings()
  const { announce } = useAnnouncer()
  const { draft, setDraft, dirty } = useDraft(settings.care)
  const [phoneError, setPhoneError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isPlausiblePhone(draft.emergencyPhone)) {
      setPhoneError('Enter a valid phone number (7–15 digits).')
      document.getElementById('care-phone')?.focus()
      announce('There is a problem with the form.')
      return
    }

    saveSection('care', draft)
    setPhoneError('')
    announce('Care preferences saved.')
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="care-heading">
      <header className="section-head">
        <h2 id="care-heading">Care Preferences</h2>
        <p>Defaults for reminders and quiet hours.</p>
      </header>

      <div className="field">
        <label htmlFor="care-lead">Remind me before a dose or appointment</label>
        <select
          id="care-lead"
          value={draft.reminderLeadMinutes}
          onChange={(event) =>
            setDraft((current) => ({ ...current, reminderLeadMinutes: Number(event.target.value) }))
          }
        >
          {REMINDER_LEAD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="care-quiet">
        <legend>Quiet hours (no non-critical alerts)</legend>
        <div className="care-quiet__row">
          <div className="field">
            <label htmlFor="care-quiet-start">From</label>
            <input
              id="care-quiet-start"
              type="time"
              value={draft.quietStart}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quietStart: event.target.value }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="care-quiet-end">To</label>
            <input
              id="care-quiet-end"
              type="time"
              value={draft.quietEnd}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quietEnd: event.target.value }))
              }
            />
          </div>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="care-phone">
          Emergency contact number <span className="req" aria-hidden="true">*</span>
        </label>
        <input
          id="care-phone"
          type="tel"
          autoComplete="tel"
          value={draft.emergencyPhone}
          aria-invalid={phoneError ? 'true' : undefined}
          aria-describedby={phoneError ? 'care-phone-error' : undefined}
          onChange={(event) => {
            setDraft((current) => ({ ...current, emergencyPhone: event.target.value }))
            if (phoneError) setPhoneError('')
          }}
        />
        {phoneError ? (
          <p id="care-phone-error" className="field__error">
            <span aria-hidden="true">⚠</span>
            {phoneError}
          </p>
        ) : null}
      </div>

      <div className="section-actions">
        <button type="submit" className="button" aria-disabled={!dirty}>
          Save Changes
        </button>
        {dirty ? <span className="section-actions__hint">Unsaved changes</span> : null}
      </div>
    </form>
  )
}
