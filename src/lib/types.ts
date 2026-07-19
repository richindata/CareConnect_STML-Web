export type DayPart = 'morning' | 'afternoon' | 'evening'

export type ReminderKind = 'medication' | 'meal' | 'appointment' | 'activity' | 'other'

export interface Reminder {
  id: string
  title: string
  /** 24-hour "HH:MM". Kept as a string so it round-trips through storage safely. */
  time: string
  kind: ReminderKind
  notes?: string
  /** ISO date strings ("YYYY-MM-DD") on which this reminder was completed. */
  completedOn: string[]
}

export interface RoutineStep {
  id: string
  title: string
  part: DayPart
  detail?: string
}

export interface Person {
  id: string
  name: string
  relationship: string
  phone: string
  /** Shown first and highlighted as the person to call when unsure. */
  isEmergencyContact: boolean
}

export interface Note {
  id: string
  body: string
  /** ISO timestamp. */
  createdAt: string
}

export interface Preferences {
  theme: 'system' | 'light' | 'dark'
  textSize: 'default' | 'large' | 'x-large'
  contrast: 'default' | 'high'
  reduceMotion: boolean
}

export interface AppData {
  reminders: Reminder[]
  routine: RoutineStep[]
  people: Person[]
  notes: Note[]
}
