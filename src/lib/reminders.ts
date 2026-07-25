import { minutesOfDay, todayKey } from './myDay'

export type ReminderCategory =
  | 'medication'
  | 'meal'
  | 'hydration'
  | 'activity'
  | 'appointment'
  | 'hygiene'
  | 'other'

export interface Reminder {
  id: string
  title: string
  /** 24-hour "HH:MM". */
  time: string
  category: ReminderCategory
  note?: string
  /** ISO dates ("YYYY-MM-DD") on which this reminder was completed. */
  completedDates: string[]
}

export const CATEGORY_META: Record<ReminderCategory, { label: string; icon: string }> = {
  medication: { label: 'Medication', icon: '💊' },
  meal: { label: 'Meal', icon: '🍽️' },
  hydration: { label: 'Drink', icon: '💧' },
  activity: { label: 'Activity', icon: '🚶' },
  appointment: { label: 'Appointment', icon: '📅' },
  hygiene: { label: 'Self-care', icon: '🛁' },
  other: { label: 'Reminder', icon: '⭐' },
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value: value as ReminderCategory,
  label: meta.label,
}))

export function isDoneToday(reminder: Reminder, day = todayKey()): boolean {
  return reminder.completedDates.includes(day)
}

/** Not-done first (earliest time first), then completed ones. */
export function orderReminders(reminders: Reminder[], day = todayKey()): Reminder[] {
  return [...reminders].sort((a, b) => {
    const doneA = isDoneToday(a, day)
    const doneB = isDoneToday(b, day)
    if (doneA !== doneB) return doneA ? 1 : -1
    return minutesOfDay(a.time) - minutesOfDay(b.time)
  })
}

export interface ReminderSummary {
  total: number
  done: number
  remaining: number
  /** Earliest not-yet-done reminder today, if any. */
  next?: Reminder
}

export function summarise(reminders: Reminder[], day = todayKey()): ReminderSummary {
  const done = reminders.filter((reminder) => isDoneToday(reminder, day)).length
  const next = [...reminders]
    .filter((reminder) => !isDoneToday(reminder, day))
    .sort((a, b) => minutesOfDay(a.time) - minutesOfDay(b.time))[0]
  return { total: reminders.length, done, remaining: reminders.length - done, next }
}

/** Seed a plausible STML day. Morning items are already ticked off. */
export function seedReminders(): Reminder[] {
  const today = todayKey()
  const base: Omit<Reminder, 'id' | 'completedDates'>[] = [
    { time: '08:00', title: 'Take morning medication', category: 'medication', note: 'Blue and white pills, with a full glass of water.' },
    { time: '08:30', title: 'Eat breakfast', category: 'meal' },
    { time: '10:00', title: 'Drink a glass of water', category: 'hydration' },
    { time: '12:30', title: 'Eat lunch', category: 'meal' },
    { time: '15:00', title: 'Afternoon walk', category: 'activity', note: 'Wear the blue jacket if it looks cold.' },
    { time: '18:00', title: 'Eat dinner', category: 'meal' },
    { time: '20:00', title: 'Take evening medication', category: 'medication', note: 'One yellow pill, after dinner.' },
    { time: '21:30', title: 'Get ready for bed', category: 'hygiene' },
  ]
  // Mark the first three as already done to show progress.
  return base.map((reminder, index) => ({
    ...reminder,
    id: `rem-seed-${index}`,
    completedDates: index < 3 ? [today] : [],
  }))
}
