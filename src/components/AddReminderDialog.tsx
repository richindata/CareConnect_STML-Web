import { useState } from 'react'
import { Dialog } from './Dialog'
import { useReminders } from '../context/RemindersProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { CATEGORY_OPTIONS, type ReminderCategory } from '../lib/reminders'

interface AddReminderDialogProps {
  open: boolean
  onClose: () => void
}

interface FieldErrors {
  title?: string
  time?: string
}

export function AddReminderDialog({ open, onClose }: AddReminderDialogProps) {
  const { addReminder } = useReminders()
  const { announce } = useAnnouncer()

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [category, setCategory] = useState<ReminderCategory>('medication')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const reset = () => {
    setTitle('')
    setTime('09:00')
    setCategory('medication')
    setNote('')
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: FieldErrors = {}
    if (!title.trim()) next.title = 'Give the reminder a name, for example “Take tablets”.'
    if (!time) next.time = 'Choose a time.'

    setErrors(next)
    if (next.title || next.time) {
      document.getElementById(next.title ? 'reminder-title' : 'reminder-time')?.focus()
      announce('There is a problem with the form.')
      return
    }

    addReminder({ title: title.trim(), time, category, note: note.trim() || undefined })
    announce(`Reminder added: ${title.trim()}.`)
    close()
  }

  return (
    <Dialog
      open={open}
      title="Add Reminder"
      description="It will appear in today’s list at the time you choose."
      onClose={close}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="reminder-title">
            What is the reminder? <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="reminder-title"
            type="text"
            autoComplete="off"
            placeholder="Take tablets"
            required
            value={title}
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={errors.title ? 'reminder-title-error' : undefined}
            onChange={(event) => {
              setTitle(event.target.value)
              if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
            }}
          />
          {errors.title ? (
            <p id="reminder-title-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reminder-time">
            At what time? <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="reminder-time"
            type="time"
            required
            value={time}
            aria-invalid={errors.time ? 'true' : undefined}
            aria-describedby={errors.time ? 'reminder-time-error' : undefined}
            onChange={(event) => {
              setTime(event.target.value)
              if (errors.time) setErrors((current) => ({ ...current, time: undefined }))
            }}
          />
          {errors.time ? (
            <p id="reminder-time-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.time}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="reminder-category">What kind of reminder?</label>
          <select
            id="reminder-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as ReminderCategory)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="reminder-note">Anything to remember? (optional)</label>
          <input
            id="reminder-note"
            type="text"
            autoComplete="off"
            placeholder="Which tablets, or where to find them"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="dialog__footer">
          <button type="button" className="button button--secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="button">
            Add Reminder
          </button>
        </div>
      </form>
    </Dialog>
  )
}
