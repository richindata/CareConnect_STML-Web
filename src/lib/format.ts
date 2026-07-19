import type { DayPart, ReminderKind } from './types'

/** "YYYY-MM-DD" for the user's local day — the key completions are stored under. */
export function todayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Minutes since local midnight, for ordering and overdue checks. */
export function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes()
}

/** "8:00 AM" in the visitor's locale, with a 24-hour fallback. */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function greetingFor(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function currentDayPart(date = new Date()): DayPart {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export const dayPartLabels: Record<DayPart, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

export const reminderKindLabels: Record<ReminderKind, string> = {
  medication: 'Medication',
  meal: 'Meal',
  appointment: 'Appointment',
  activity: 'Activity',
  other: 'Other',
}

/** Decorative only — every icon sits next to a real text label. */
export const reminderKindIcons: Record<ReminderKind, string> = {
  medication: '💊',
  meal: '🍽️',
  appointment: '📅',
  activity: '🚶',
  other: '⭐',
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/** Strips formatting so the digits are safe inside a tel: URL. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
