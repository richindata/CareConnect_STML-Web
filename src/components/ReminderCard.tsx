import { useReminders } from '../context/RemindersProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { CATEGORY_META, isDoneToday, type Reminder } from '../lib/reminders'
import { formatTime } from '../lib/myDay'

interface ReminderCardProps {
  reminder: Reminder
  isNext?: boolean
  onRemove: (reminder: Reminder) => void
}

/**
 * One reminder, sized large for people with short-term memory loss: a big
 * check control with a plain-language label, the time in words, and an optional
 * note. The whole title is the checkbox label, so the touch target is generous.
 */
export function ReminderCard({ reminder, isNext, onRemove }: ReminderCardProps) {
  const { toggleToday } = useReminders()
  const { announce } = useAnnouncer()

  const done = isDoneToday(reminder)
  const meta = CATEGORY_META[reminder.category]
  const inputId = `reminder-${reminder.id}`
  const noteId = reminder.note ? `${inputId}-note` : undefined

  return (
    <li className={`reminder ${done ? 'is-done' : ''} ${isNext && !done ? 'is-next' : ''}`.trim()}>
      <input
        type="checkbox"
        id={inputId}
        className="reminder__check"
        checked={done}
        aria-describedby={noteId}
        onChange={() => {
          toggleToday(reminder.id)
          announce(
            done
              ? `${reminder.title} marked as not done.`
              : `${reminder.title} done. Well done!`,
          )
        }}
      />

      <div className="reminder__body">
        <label className="reminder__title" htmlFor={inputId}>
          <span className="reminder__icon" aria-hidden="true">
            {meta.icon}
          </span>
          {reminder.title}
        </label>

        <p className="reminder__meta">
          <span className="reminder__time">
            <span className="visually-hidden">At </span>
            <time dateTime={reminder.time}>{formatTime(reminder.time)}</time>
          </span>
          <span className="reminder__cat">{meta.label}</span>
          {isNext && !done ? <span className="badge badge--primary">Next up</span> : null}
          {done ? <span className="badge badge--success">Done</span> : null}
        </p>

        {reminder.note ? (
          <p id={noteId} className="reminder__note">
            {reminder.note}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        className="button button--danger-text reminder__remove"
        onClick={() => onRemove(reminder)}
      >
        <span aria-hidden="true">🗑</span>
        <span className="visually-hidden">Remove reminder: {reminder.title}</span>
      </button>
    </li>
  )
}
