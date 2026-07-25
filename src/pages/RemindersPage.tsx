import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthProvider'
import { useReminders } from '../context/RemindersProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { ReminderCard } from '../components/ReminderCard'
import { AddReminderDialog } from '../components/AddReminderDialog'
import { Dialog } from '../components/Dialog'
import { formatTime } from '../lib/myDay'
import type { Reminder } from '../lib/reminders'

export function RemindersPage() {
  useDocumentTitle('Reminders')
  const { user } = useAuth()
  const { ordered, summary, removeReminder } = useReminders()
  const { announce } = useAnnouncer()

  const [addOpen, setAddOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<Reminder | null>(null)

  const subject = user?.caringFor?.trim().split(' ')[0]
  const heading = subject ? `${subject}’s Reminders` : 'Reminders'

  const allDone = summary.total > 0 && summary.remaining === 0

  const confirmRemove = () => {
    if (!pendingRemove) return
    removeReminder(pendingRemove.id)
    announce(`Reminder removed: ${pendingRemove.title}.`)
    setPendingRemove(null)
  }

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">Reminders</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>{heading}</h1>
        <button type="button" className="button" onClick={() => setAddOpen(true)}>
          <span aria-hidden="true">＋</span>
          Add Reminder
        </button>
      </div>

      {/* Big, plain-language status — announced as the list changes. */}
      <section className={`reminders-status ${allDone ? 'is-complete' : ''}`.trim()} aria-labelledby="reminders-status-heading">
        <h2 id="reminders-status-heading" className="visually-hidden">
          How today is going
        </h2>
        <p className="reminders-status__line" role="status">
          {summary.total === 0
            ? 'There are no reminders yet. Add the first one below.'
            : allDone
              ? `All done for today — every one of your ${summary.total} reminders. Nothing else is needed.`
              : `${summary.done} of ${summary.total} done.`}
        </p>
        {summary.next ? (
          <p className="reminders-status__next">
            <span aria-hidden="true">👉</span> Next: <strong>{summary.next.title}</strong> at{' '}
            <strong>{formatTime(summary.next.time)}</strong>.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="reminders-list-heading">
        <h2 id="reminders-list-heading" className="visually-hidden">
          Today’s reminders
        </h2>

        {ordered.length === 0 ? (
          <p className="day-list__empty">
            No reminders yet. Use <strong>Add Reminder</strong> to create the first one.
          </p>
        ) : (
          <ul className="reminder-list">
            {ordered.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                isNext={summary.next?.id === reminder.id}
                onRemove={setPendingRemove}
              />
            ))}
          </ul>
        )}
      </section>

      <AddReminderDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog
        open={pendingRemove !== null}
        title="Remove this reminder?"
        description={pendingRemove ? `“${pendingRemove.title}” will be removed from the list.` : undefined}
        onClose={() => setPendingRemove(null)}
      >
        <div className="dialog__footer">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setPendingRemove(null)}
          >
            Keep it
          </button>
          <button type="button" className="button button--danger" onClick={confirmRemove}>
            Yes, remove
          </button>
        </div>
      </Dialog>
    </>
  )
}
