import { useAppData } from '../context/AppDataProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { formatTime, reminderKindIcons, reminderKindLabels } from '../lib/format'
import type { Reminder } from '../lib/types'

interface ReminderItemProps {
  reminder: Reminder
  /** Marks the single reminder that is coming up next today. */
  isNext?: boolean
  isOverdue?: boolean
  onRemove?: (reminder: Reminder) => void
}

/**
 * One reminder as a native checkbox with a real <label>, so it is focusable,
 * toggles with Space, and reports its checked state without any ARIA.
 */
export function ReminderItem({ reminder, isNext, isOverdue, onRemove }: ReminderItemProps) {
  const { isReminderDoneToday, toggleReminderToday } = useAppData()
  const { announce } = useAnnouncer()

  const done = isReminderDoneToday(reminder)
  const inputId = `reminder-${reminder.id}`
  const detailsId = reminder.notes ? `${inputId}-notes` : undefined

  const handleToggle = () => {
    toggleReminderToday(reminder.id)
    announce(
      done
        ? `${reminder.title} marked as not done.`
        : `${reminder.title} marked as done. Well done.`,
    )
  }

  const state = done ? 'task--done' : isOverdue ? 'task--overdue' : isNext ? 'task--next' : ''

  return (
    <li className={`task ${state}`.trim()}>
      <input
        type="checkbox"
        id={inputId}
        checked={done}
        onChange={handleToggle}
        aria-describedby={detailsId}
      />

      <div className="task__body">
        <label className="task__title" htmlFor={inputId}>
          <span aria-hidden="true">{reminderKindIcons[reminder.kind]} </span>
          {reminder.title}
        </label>

        <p className="task__meta">
          <span>
            <span className="visually-hidden">Scheduled for </span>
            <time dateTime={reminder.time}>{formatTime(reminder.time)}</time>
          </span>
          <span>{reminderKindLabels[reminder.kind]}</span>
          {isOverdue && !done ? <span className="badge badge--danger">Overdue</span> : null}
          {isNext && !done ? <span className="badge badge--accent">Up next</span> : null}
          {done ? <span className="badge badge--success">Done</span> : null}
        </p>

        {reminder.notes ? (
          <p id={detailsId} className="field__hint">
            {reminder.notes}
          </p>
        ) : null}
      </div>

      {onRemove ? (
        <button
          type="button"
          className="button button--danger"
          onClick={() => onRemove(reminder)}
        >
          <span aria-hidden="true">🗑</span>
          <span className="visually-hidden">Delete reminder: {reminder.title}</span>
        </button>
      ) : null}
    </li>
  )
}
