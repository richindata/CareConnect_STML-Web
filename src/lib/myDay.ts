export interface Task {
  id: string
  /** Local day the task belongs to, "YYYY-MM-DD". */
  date: string
  /** 24-hour "HH:MM", kept as a string so it round-trips through storage. */
  time: string
  title: string
  assignee: string
  done: boolean
}

/** "YYYY-MM-DD" for a local date — the key tasks are grouped under. */
export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(): string {
  return dateKey(new Date())
}

/** The seven dates of the Sunday–Saturday week containing `reference`. */
export function weekOf(reference: Date): Date[] {
  const start = new Date(reference)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay()) // back up to Sunday
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

export function shortWeekday(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)
}

export function longDate(dateKeyStr: string): string {
  const date = new Date(`${dateKeyStr}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

/** "6:30 AM" in the visitor's locale, with a 24-hour fallback. */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export const KNOWN_ASSIGNEES = [
  'Sarah Jenkins',
  'Nurse Jenny',
  'Michael Jenkins',
  'Rosa Gutierrez',
] as const

/** Seed a plausible day, attached to today so the default view is populated. */
export function seedTasks(): Task[] {
  const today = todayKey()
  const base: Omit<Task, 'id' | 'date'>[] = [
    { time: '06:30', title: 'Wake-up routine', assignee: 'Sarah Jenkins', done: true },
    { time: '07:00', title: 'Breakfast + morning meds', assignee: 'Sarah Jenkins', done: true },
    { time: '10:00', title: 'Physical therapy', assignee: 'Nurse Jenny', done: true },
    { time: '12:00', title: 'Lunch', assignee: 'Sarah Jenkins', done: true },
    { time: '14:00', title: 'Doctor visit', assignee: 'Nurse Jenny', done: false },
    { time: '17:00', title: 'Evening walk', assignee: 'Michael Jenkins', done: false },
    { time: '18:00', title: 'Dinner + evening meds', assignee: 'Sarah Jenkins', done: false },
    { time: '21:00', title: 'Bedtime routine', assignee: 'Sarah Jenkins', done: false },
  ]
  return base.map((task, index) => ({ ...task, id: `task-seed-${index}`, date: today }))
}
