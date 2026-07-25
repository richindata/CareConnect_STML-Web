import { minutesOfDay, todayKey } from './myDay'

export interface Medication {
  id: string
  name: string
  dosage: string
  instructions?: string
  /** Scheduled dose times as 24-hour "HH:MM", sorted. */
  times: string[]
  /** Doses taken, each entry "YYYY-MM-DD|HH:MM". */
  takenLog: string[]
}

/** A single dose of a medication on the current day. */
export interface Dose {
  medId: string
  name: string
  dosage: string
  instructions?: string
  time: string
  taken: boolean
}

/** Preset schedules, so the add form never asks the user to type times by hand. */
export const FREQUENCIES = [
  { id: 'once', label: 'Once daily (morning)', times: ['08:00'] },
  { id: 'twice', label: 'Twice daily (morning & evening)', times: ['08:00', '20:00'] },
  { id: 'thrice', label: 'Three times daily', times: ['08:00', '14:00', '20:00'] },
  { id: 'bedtime', label: 'At bedtime', times: ['21:00'] },
] as const

export type FrequencyId = (typeof FREQUENCIES)[number]['id']

export function timesForFrequency(id: FrequencyId): string[] {
  return FREQUENCIES.find((frequency) => frequency.id === id)?.times.slice() ?? ['08:00']
}

function doseKey(date: string, time: string): string {
  return `${date}|${time}`
}

export function isDoseTaken(med: Medication, time: string, day = todayKey()): boolean {
  return med.takenLog.includes(doseKey(day, time))
}

/** Returns the takenLog with `time` toggled for the given day. */
export function toggleDoseLog(med: Medication, time: string, day = todayKey()): string[] {
  const key = doseKey(day, time)
  return med.takenLog.includes(key)
    ? med.takenLog.filter((entry) => entry !== key)
    : [...med.takenLog, key]
}

/** Every dose scheduled for `day`, flattened across medications and time-sorted. */
export function dosesForDay(meds: Medication[], day = todayKey()): Dose[] {
  return meds
    .flatMap((med) =>
      med.times.map<Dose>((time) => ({
        medId: med.id,
        name: med.name,
        dosage: med.dosage,
        instructions: med.instructions,
        time,
        taken: isDoseTaken(med, time, day),
      })),
    )
    .sort((a, b) => minutesOfDay(a.time) - minutesOfDay(b.time))
}

export interface DoseSummary {
  total: number
  taken: number
  remaining: number
  /** The next untaken dose today, if any. */
  next?: Dose
}

export function summariseDoses(meds: Medication[], day = todayKey()): DoseSummary {
  const doses = dosesForDay(meds, day)
  const taken = doses.filter((dose) => dose.taken).length
  return {
    total: doses.length,
    taken,
    remaining: doses.length - taken,
    next: doses.find((dose) => !dose.taken),
  }
}

/** Seed a plausible medication list. Some morning doses are already taken. */
export function seedMedications(): Medication[] {
  const today = todayKey()
  return [
    {
      id: 'med-metformin',
      name: 'Metformin',
      dosage: '500 mg',
      instructions: 'Take with food.',
      times: ['08:00', '20:00'],
      takenLog: [`${today}|08:00`],
    },
    {
      id: 'med-lisinopril',
      name: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'For blood pressure.',
      times: ['08:00'],
      takenLog: [],
    },
    {
      id: 'med-aspirin',
      name: 'Aspirin',
      dosage: '81 mg',
      instructions: 'With breakfast.',
      times: ['08:00'],
      takenLog: [`${today}|08:00`],
    },
    {
      id: 'med-vitamind',
      name: 'Vitamin D',
      dosage: '1000 IU',
      times: ['08:00'],
      takenLog: [],
    },
    {
      id: 'med-donepezil',
      name: 'Donepezil',
      dosage: '5 mg',
      instructions: 'At bedtime.',
      times: ['21:00'],
      takenLog: [],
    },
  ]
}
