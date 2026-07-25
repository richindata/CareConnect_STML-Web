import { dosesForDay, type Medication } from './meds'
import type { Task } from './myDay'
import type { TeamMember } from './careTeam'

/* -------------------------------------------------------------------------- */
/* Message + widget model                                                     */
/* -------------------------------------------------------------------------- */

export interface MedLine {
  name: string
  dosage: string
  time: string
  taken: boolean
}

export interface SleepDay {
  label: string
  hours: number
  /** Flagged when the night was notably short or restless. */
  anomaly?: boolean
}

export interface TeamLine {
  name: string
  role: string
  status: string
}

export interface AppointmentLine {
  title: string
  time: string
  assignee: string
}

export type Widget =
  | { kind: 'meds'; items: MedLine[] }
  | { kind: 'sleep'; days: SleepDay[]; averageHours: number }
  | { kind: 'careTeam'; members: TeamLine[] }
  | { kind: 'appointments'; items: AppointmentLine[] }

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** ISO timestamp. */
  at: string
  widget?: Widget
}

export interface Suggestion {
  id: string
  label: string
  prompt: string
}

export const SUGGESTIONS: Suggestion[] = [
  { id: 'team', label: 'Show care team schedule', prompt: 'Show the care team schedule' },
  { id: 'interactions', label: 'Medication interactions', prompt: 'Are there any medication interactions?' },
  { id: 'summary', label: 'Weekly health summary', prompt: 'Give me a weekly health summary' },
  { id: 'appointments', label: 'Upcoming appointments', prompt: 'What are the upcoming appointments?' },
]

/** Sample sleep history. Clearly illustrative — there is no wearable feed. */
export const SLEEP_HISTORY: SleepDay[] = [
  { label: 'Mon', hours: 7.4 },
  { label: 'Tue', hours: 7.1 },
  { label: 'Wed', hours: 7.6 },
  { label: 'Thu', hours: 6.9 },
  { label: 'Fri', hours: 7.3 },
  { label: 'Sat', hours: 5.5, anomaly: true },
  { label: 'Sun', hours: 7.2 },
]

function averageHours(days: SleepDay[]): number {
  const total = days.reduce((sum, day) => sum + day.hours, 0)
  return Math.round((total / days.length) * 10) / 10
}

/* -------------------------------------------------------------------------- */
/* Reply generation — deterministic, from local data                          */
/* -------------------------------------------------------------------------- */

export interface AssistantContext {
  subject: string
  medications: Medication[]
  tasks: Task[]
  team: TeamMember[]
}

export interface GeneratedReply {
  text: string
  widget?: Widget
}

const APPOINTMENT_HINTS = ['doctor', 'appointment', 'visit', 'therapy', 'checkup', 'clinic']

function medsReply(ctx: AssistantContext): GeneratedReply {
  const doses = dosesForDay(ctx.medications)
  if (doses.length === 0) {
    return { text: `There are no medications scheduled for ${ctx.subject} today.` }
  }
  return {
    text: `Here are the medications scheduled for ${ctx.subject} today:`,
    widget: {
      kind: 'meds',
      items: doses.map((dose) => ({
        name: dose.name,
        dosage: dose.dosage,
        time: dose.time,
        taken: dose.taken,
      })),
    },
  }
}

function careTeamReply(ctx: AssistantContext): GeneratedReply {
  if (ctx.team.length === 0) return { text: `No one is on ${ctx.subject}’s care team yet.` }
  return {
    text: `Here is ${ctx.subject}’s care team and who is available right now:`,
    widget: {
      kind: 'careTeam',
      members: ctx.team.map((member) => ({
        name: member.name,
        role: member.role,
        status: member.status === 'active' ? 'Active now' : member.statusNote,
      })),
    },
  }
}

function appointmentsReply(ctx: AssistantContext): GeneratedReply {
  const items = ctx.tasks
    .filter((task) => APPOINTMENT_HINTS.some((hint) => task.title.toLowerCase().includes(hint)))
    .map((task) => ({ title: task.title, time: task.time, assignee: task.assignee }))
  if (items.length === 0) {
    return { text: `I could not find any appointments on ${ctx.subject}’s schedule today.` }
  }
  return {
    text: `These look like appointments on ${ctx.subject}’s schedule:`,
    widget: { kind: 'appointments', items },
  }
}

function sleepReply(ctx: AssistantContext): GeneratedReply {
  const avg = averageHours(SLEEP_HISTORY)
  const anomaly = SLEEP_HISTORY.find((day) => day.anomaly)
  const note = anomaly
    ? ` We noticed a shorter night on ${anomaly.label} (${anomaly.hours} hours), with some restlessness.`
    : ''
  return {
    text: `${ctx.subject}’s sleep has been relatively stable this week, averaging ${avg} hours.${note}`,
    widget: { kind: 'sleep', days: SLEEP_HISTORY, averageHours: avg },
  }
}

function interactionsReply(ctx: AssistantContext): GeneratedReply {
  const names = ctx.medications.map((med) => med.name).join(', ')
  return {
    text:
      `I can list what ${ctx.subject} is taking${names ? ` — ${names}` : ''} — but I can’t check ` +
      `real drug interactions. Please confirm any interaction questions with a pharmacist or ` +
      `${ctx.subject}’s doctor.`,
  }
}

function fallbackReply(ctx: AssistantContext): GeneratedReply {
  return {
    text:
      `I’m a demo assistant for ${ctx.subject}’s care, so I answer from what’s in CareConnect ` +
      `rather than a live AI. Try: today’s medications, the care team schedule, upcoming ` +
      `appointments, or a weekly health summary.`,
  }
}

/**
 * Maps a free-text prompt to a reply using keyword rules over the app's own
 * data. Deterministic and offline — there is no network call or language model.
 */
export function generateReply(prompt: string, ctx: AssistantContext): GeneratedReply {
  const text = prompt.toLowerCase()
  const has = (...words: string[]) => words.some((word) => text.includes(word))

  if (has('interaction')) return interactionsReply(ctx)
  if (has('sleep', 'health summary', 'weekly', 'rest')) return sleepReply(ctx)
  if (has('appointment', 'visit', 'doctor', 'upcoming')) return appointmentsReply(ctx)
  if (has('team', 'who', 'caregiver', 'nurse', 'schedule')) return careTeamReply(ctx)
  if (has('med', 'pill', 'dose', 'tablet', 'due')) return medsReply(ctx)
  return fallbackReply(ctx)
}
