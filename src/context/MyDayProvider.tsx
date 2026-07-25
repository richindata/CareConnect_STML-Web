import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import { minutesOfDay, seedTasks, todayKey, type Task } from '../lib/myDay'

const STORAGE_KEY = 'careconnect.myday.v1'

interface AddTaskInput {
  title: string
  time: string
  assignee: string
  date: string
}

interface MyDayValue {
  tasks: Task[]
  selectedDate: string
  /** Tasks for the selected day, ordered by time. */
  tasksForSelectedDay: Task[]
  selectDate: (date: string) => void
  toggleTask: (id: string) => void
  addTask: (input: AddTaskInput) => void
}

const MyDayContext = createContext<MyDayValue | null>(null)

export function MyDayProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    readStored<Task[] | null>(STORAGE_KEY, null) ?? seedTasks(),
  )
  const [selectedDate, setSelectedDate] = useState<string>(() => todayKey())

  useEffect(() => {
    writeStored(STORAGE_KEY, tasks)
  }, [tasks])

  const tasksForSelectedDay = useMemo(
    () =>
      tasks
        .filter((task) => task.date === selectedDate)
        .sort((a, b) => minutesOfDay(a.time) - minutesOfDay(b.time)),
    [tasks, selectedDate],
  )

  const value = useMemo<MyDayValue>(
    () => ({
      tasks,
      selectedDate,
      tasksForSelectedDay,
      selectDate: setSelectedDate,
      toggleTask: (id) =>
        setTasks((current) =>
          current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
        ),
      addTask: ({ title, time, assignee, date }) =>
        setTasks((current) => [
          ...current,
          { id: createId('task'), title, time, assignee, date, done: false },
        ]),
    }),
    [tasks, selectedDate, tasksForSelectedDay],
  )

  return <MyDayContext.Provider value={value}>{children}</MyDayContext.Provider>
}

export function useMyDay(): MyDayValue {
  const context = useContext(MyDayContext)
  if (!context) throw new Error('useMyDay must be used inside <MyDayProvider>')
  return context
}
