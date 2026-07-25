import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import { todayKey } from '../lib/myDay'
import {
  orderReminders,
  seedReminders,
  summarise,
  type Reminder,
  type ReminderCategory,
  type ReminderSummary,
} from '../lib/reminders'

const STORAGE_KEY = 'careconnect.reminders.v1'

interface AddReminderInput {
  title: string
  time: string
  category: ReminderCategory
  note?: string
}

interface RemindersValue {
  reminders: Reminder[]
  /** Ordered for display: not-done first by time, then completed. */
  ordered: Reminder[]
  summary: ReminderSummary
  addReminder: (input: AddReminderInput) => void
  toggleToday: (id: string) => void
  removeReminder: (id: string) => void
}

const RemindersContext = createContext<RemindersValue | null>(null)

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>(
    () => readStored<Reminder[] | null>(STORAGE_KEY, null) ?? seedReminders(),
  )

  useEffect(() => {
    writeStored(STORAGE_KEY, reminders)
  }, [reminders])

  const value = useMemo<RemindersValue>(
    () => ({
      reminders,
      ordered: orderReminders(reminders),
      summary: summarise(reminders),

      addReminder: ({ title, time, category, note }) =>
        setReminders((current) => [
          ...current,
          { id: createId('rem'), title, time, category, note, completedDates: [] },
        ]),

      toggleToday: (id) =>
        setReminders((current) =>
          current.map((reminder) => {
            if (reminder.id !== id) return reminder
            const key = todayKey()
            const done = reminder.completedDates.includes(key)
            return {
              ...reminder,
              completedDates: done
                ? reminder.completedDates.filter((entry) => entry !== key)
                : [...reminder.completedDates, key],
            }
          }),
        ),

      removeReminder: (id) =>
        setReminders((current) => current.filter((reminder) => reminder.id !== id)),
    }),
    [reminders],
  )

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>
}

export function useReminders(): RemindersValue {
  const context = useContext(RemindersContext)
  if (!context) throw new Error('useReminders must be used inside <RemindersProvider>')
  return context
}
