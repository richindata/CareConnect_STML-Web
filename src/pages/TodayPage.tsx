import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ReminderItem } from '../components/ReminderItem'
import { useAppData } from '../context/AppDataProvider'
import {
  currentDayPart,
  dayPartLabels,
  formatLongDate,
  formatTime,
  greetingFor,
  initialsOf,
  minutesOfDay,
  nowMinutes,
  telHref,
} from '../lib/format'

/** Re-renders on a timer so "up next" and "overdue" stay true as the day moves. */
function useClock(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function TodayPage() {
  const { data, isReminderDoneToday } = useAppData()
  const now = useClock()

  const { ordered, nextId, doneCount } = useMemo(() => {
    const sorted = [...data.reminders].sort(
      (a, b) => minutesOfDay(a.time) - minutesOfDay(b.time),
    )
    const minutes = nowMinutes(now)
    const next = sorted.find(
      (reminder) => !isReminderDoneToday(reminder) && minutesOfDay(reminder.time) >= minutes,
    )
    return {
      ordered: sorted,
      nextId: next?.id,
      doneCount: sorted.filter(isReminderDoneToday).length,
    }
  }, [data.reminders, isReminderDoneToday, now])

  const part = currentDayPart(now)
  const routineNow = data.routine.filter((step) => step.part === part)
  const emergency = data.people.find((person) => person.isEmergencyContact) ?? data.people[0]
  const remaining = ordered.length - doneCount

  return (
    <>
      <PageHeader
        title={`${greetingFor(now)}.`}
        documentTitle="Today"
        intro={
          <>
            Today is <strong>{formatLongDate(now)}</strong>. The time is{' '}
            <strong>{formatTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`)}</strong>.
          </>
        }
      />

      <section className="card" aria-labelledby="today-summary-heading">
        <h2 id="today-summary-heading">How today is going</h2>
        <p>
          {ordered.length === 0
            ? 'There is nothing scheduled today.'
            : remaining === 0
              ? `Everything is done — all ${ordered.length} things on your list. Nothing else is needed today.`
              : `You have finished ${doneCount} of ${ordered.length}. ${remaining} still to do.`}
        </p>
      </section>

      <section className="section" aria-labelledby="today-reminders-heading">
        <div className="section__header">
          <h2 id="today-reminders-heading">Today&rsquo;s reminders</h2>
          <Link className="button button--ghost" to="/reminders">
            Manage reminders
          </Link>
        </div>

        {ordered.length === 0 ? (
          <p className="empty-state">
            No reminders yet. <Link to="/reminders">Add the first one</Link>.
          </p>
        ) : (
          <ul className="task-list">
            {ordered.map((reminder) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                isNext={reminder.id === nextId}
                isOverdue={
                  minutesOfDay(reminder.time) < nowMinutes(now) && !isReminderDoneToday(reminder)
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="section" aria-labelledby="today-routine-heading">
        <div className="section__header">
          <h2 id="today-routine-heading">Your {dayPartLabels[part].toLowerCase()}</h2>
          <Link className="button button--ghost" to="/routine">
            See the whole day
          </Link>
        </div>

        {routineNow.length === 0 ? (
          <p className="empty-state">Nothing set for this part of the day.</p>
        ) : (
          <ol className="task-list">
            {routineNow.map((step) => (
              <li key={step.id} className="task">
                <div className="task__body">
                  <p className="task__title">{step.title}</p>
                  {step.detail ? <p className="field__hint">{step.detail}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {emergency ? (
        <section className="section" aria-labelledby="today-help-heading">
          <h2 id="today-help-heading">If you need help</h2>
          <div className="card">
            <div className="person">
              <p className="person__avatar" aria-hidden="true">
                {initialsOf(emergency.name)}
              </p>
              <div>
                <h3>{emergency.name}</h3>
                <p className="person__relationship">{emergency.relationship}</p>
              </div>
              <p className="button-row">
                <a className="button" href={telHref(emergency.phone)}>
                  <span aria-hidden="true">📞</span>
                  Call {emergency.name.split(' ')[0]}
                  <span className="visually-hidden"> on {emergency.phone}</span>
                </a>
                <Link className="button button--secondary" to="/people">
                  Everyone else
                </Link>
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
