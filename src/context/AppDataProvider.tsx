import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import { todayKey } from '../lib/format'
import { seedData } from '../lib/seed'
import type { AppData, Person, Reminder, RoutineStep } from '../lib/types'

const STORAGE_KEY = 'careconnect.data.v1'

interface AppDataValue {
  data: AppData
  isReminderDoneToday: (reminder: Reminder) => boolean
  toggleReminderToday: (id: string) => void
  addReminder: (input: Omit<Reminder, 'id' | 'completedOn'>) => void
  removeReminder: (id: string) => void
  addPerson: (input: Omit<Person, 'id'>) => void
  removePerson: (id: string) => void
  addNote: (body: string) => void
  removeNote: (id: string) => void
  addRoutineStep: (input: Omit<RoutineStep, 'id'>) => void
  removeRoutineStep: (id: string) => void
  resetToSeed: () => void
}

const AppDataContext = createContext<AppDataValue | null>(null)

/** Merges stored data over the seed so a partial or older payload still loads. */
function loadInitialData(): AppData {
  const stored = readStored<Partial<AppData>>(STORAGE_KEY, {})
  return {
    reminders: stored.reminders ?? seedData.reminders,
    routine: stored.routine ?? seedData.routine,
    people: stored.people ?? seedData.people,
    notes: stored.notes ?? seedData.notes,
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitialData)

  useEffect(() => {
    writeStored(STORAGE_KEY, data)
  }, [data])

  const value = useMemo<AppDataValue>(() => {
    const update = (patch: (current: AppData) => Partial<AppData>) =>
      setData((current) => ({ ...current, ...patch(current) }))

    return {
      data,

      isReminderDoneToday: (reminder) => reminder.completedOn.includes(todayKey()),

      toggleReminderToday: (id) =>
        update((current) => ({
          reminders: current.reminders.map((reminder) => {
            if (reminder.id !== id) return reminder
            const key = todayKey()
            const done = reminder.completedOn.includes(key)
            return {
              ...reminder,
              completedOn: done
                ? reminder.completedOn.filter((entry) => entry !== key)
                : [...reminder.completedOn, key],
            }
          }),
        })),

      addReminder: (input) =>
        update((current) => ({
          reminders: [...current.reminders, { ...input, id: createId('rem'), completedOn: [] }],
        })),

      removeReminder: (id) =>
        update((current) => ({
          reminders: current.reminders.filter((reminder) => reminder.id !== id),
        })),

      addPerson: (input) =>
        update((current) => ({ people: [...current.people, { ...input, id: createId('per') }] })),

      removePerson: (id) =>
        update((current) => ({ people: current.people.filter((person) => person.id !== id) })),

      addNote: (body) =>
        update((current) => ({
          notes: [
            { id: createId('note'), body, createdAt: new Date().toISOString() },
            ...current.notes,
          ],
        })),

      removeNote: (id) =>
        update((current) => ({ notes: current.notes.filter((note) => note.id !== id) })),

      addRoutineStep: (input) =>
        update((current) => ({ routine: [...current.routine, { ...input, id: createId('ro') }] })),

      removeRoutineStep: (id) =>
        update((current) => ({ routine: current.routine.filter((step) => step.id !== id) })),

      resetToSeed: () => setData(structuredClone(seedData)),
    }
  }, [data])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside <AppDataProvider>')
  return context
}
