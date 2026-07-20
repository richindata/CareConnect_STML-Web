export interface ScheduleItem {
  id: string
  time: string
  title: string
  detail: string
  done: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: string
  tone: 'primary' | 'specialist' | 'family'
}

export interface ActivityEntry {
  id: string
  actor: string
  action: string
  subject: string
  when: string
}

/** Illustrative dashboard content. No backend exists to supply the real thing. */
export const todaySchedule: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '07:30 AM',
    title: 'Morning Meds Routine',
    detail: 'Metformin 500mg + Aspirin',
    done: true,
  },
  {
    id: 'sch-2',
    time: '08:30 AM',
    title: 'Breakfast Prep',
    detail: 'Oatmeal and tea, assist to table',
    done: true,
  },
  {
    id: 'sch-3',
    time: '02:00 PM',
    title: 'Doctor Appointment',
    detail: 'Dr. Martinez — Geriatric Checkup',
    done: false,
  },
  {
    id: 'sch-4',
    time: '04:30 PM',
    title: 'Physical Therapy Exercises',
    detail: 'Leg extensions and walking assistance',
    done: false,
  },
]

export const careTeam: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Jenkins', role: 'Primary Caregiver (You)', tone: 'primary' },
  { id: 'tm-2', name: 'Nurse Jenny', role: 'Specialist (LPN)', tone: 'specialist' },
  { id: 'tm-3', name: 'Michael Jenkins', role: 'Family (Brother)', tone: 'family' },
]

export const recentActivity: ActivityEntry[] = [
  {
    id: 'ac-1',
    actor: 'Nurse Jenny',
    action: 'logged a task',
    subject: 'Physical Therapy',
    when: '1 hour ago',
  },
  {
    id: 'ac-2',
    actor: 'Sarah J.',
    action: 'marked med taken',
    subject: 'Aspirin 81mg',
    when: '2 hours ago',
  },
]

export const summaryStats = [
  {
    id: 'st-1',
    label: 'Upcoming tasks today',
    value: '5 Tasks',
    detail: 'Next due: 2:00 PM',
    tone: 'accent' as const,
  },
  {
    id: 'st-2',
    label: 'Medication reminders',
    value: '3 Pending',
    detail: 'Lisinopril is next',
    tone: 'accent' as const,
  },
  {
    id: 'st-3',
    label: 'Unread messages',
    value: '2 Messages',
    detail: 'Latest from Dr. Martinez',
    tone: 'success' as const,
  },
]

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function greetingFor(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
