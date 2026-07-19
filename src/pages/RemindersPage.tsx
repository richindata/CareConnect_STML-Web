import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ReminderItem } from '../components/ReminderItem'
import { Dialog } from '../components/Dialog'
import { useAppData } from '../context/AppDataProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { minutesOfDay, reminderKindLabels } from '../lib/format'
import type { Reminder, ReminderKind } from '../lib/types'

const kinds = Object.keys(reminderKindLabels) as ReminderKind[]

export function RemindersPage() {
  const { data, addReminder, removeReminder } = useAppData()
  const { announce } = useAnnouncer()

  const [addOpen, setAddOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Reminder | null>(null)

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [kind, setKind] = useState<ReminderKind>('medication')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const ordered = useMemo(
    () => [...data.reminders].sort((a, b) => minutesOfDay(a.time) - minutesOfDay(b.time)),
    [data.reminders],
  )

  const resetForm = () => {
    setTitle('')
    setTime('09:00')
    setKind('medication')
    setNotes('')
    setError('')
  }

  const closeAdd = () => {
    setAddOpen(false)
    resetForm()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      // Validation is reported in text next to the field, not just by colour.
      setError('Please give the reminder a name, for example “Take morning tablets”.')
      document.getElementById('reminder-title')?.focus()
      return
    }
    addReminder({ title: trimmed, time, kind, notes: notes.trim() || undefined })
    announce(`Reminder added: ${trimmed}.`)
    closeAdd()
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    removeReminder(pendingDelete.id)
    announce(`Reminder deleted: ${pendingDelete.title}.`)
    setPendingDelete(null)
  }

  return (
    <>
      <PageHeader
        title="Reminders"
        intro="Everything you have asked CareConnect to remind you about, in time order. Tick one off when it is done."
        actions={
          <button type="button" className="button" onClick={() => setAddOpen(true)}>
            <span aria-hidden="true">＋</span>
            Add a reminder
          </button>
        }
      />

      {ordered.length === 0 ? (
        <p className="empty-state">
          There are no reminders yet. Use <strong>Add a reminder</strong> to create the first one.
        </p>
      ) : (
        <ul className="task-list">
          {ordered.map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} onRemove={setPendingDelete} />
          ))}
        </ul>
      )}

      <Dialog
        open={addOpen}
        title="Add a reminder"
        description="It will appear on Today at the time you choose."
        onClose={closeAdd}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="reminder-title">What is the reminder?</label>
            <input
              id="reminder-title"
              type="text"
              value={title}
              autoComplete="off"
              required
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'reminder-title-error' : undefined}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
            />
            {error ? (
              <p id="reminder-title-error" className="field__error">
                <span aria-hidden="true">⚠</span>
                {error}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="reminder-time">At what time?</label>
            <input
              id="reminder-time"
              type="time"
              value={time}
              required
              onChange={(event) => setTime(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="reminder-kind">What kind of reminder is it?</label>
            <select
              id="reminder-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as ReminderKind)}
            >
              {kinds.map((option) => (
                <option key={option} value={option}>
                  {reminderKindLabels[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="reminder-notes">Anything else to remember? (optional)</label>
            <textarea
              id="reminder-notes"
              value={notes}
              aria-describedby="reminder-notes-hint"
              onChange={(event) => setNotes(event.target.value)}
            />
            <p id="reminder-notes-hint" className="field__hint">
              For example which tablets to take, or where to find them.
            </p>
          </div>

          <div className="dialog__footer">
            <button type="button" className="button button--secondary" onClick={closeAdd}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save reminder
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        title="Delete this reminder?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed. This cannot be undone.`
            : undefined
        }
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setPendingDelete(null)}
            >
              Keep it
            </button>
            <button type="button" className="button button--danger" onClick={confirmDelete}>
              Yes, delete it
            </button>
          </>
        }
      >
        <p>Nothing else on your list will change.</p>
      </Dialog>
    </>
  )
}
