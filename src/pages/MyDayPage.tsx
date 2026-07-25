import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthProvider'
import { useMyDay } from '../context/MyDayProvider'
import { WeekSelector } from '../components/WeekSelector'
import { TaskRow } from '../components/TaskRow'
import { AddTaskDialog } from '../components/AddTaskDialog'
import { longDate } from '../lib/myDay'

export function MyDayPage() {
  useDocumentTitle('My Day')
  const { user } = useAuth()
  const { selectedDate, tasksForSelectedDay } = useMyDay()
  const [addOpen, setAddOpen] = useState(false)

  const subject = user?.caringFor?.trim().split(' ')[0]
  const heading = subject ? `${subject}’s Schedule` : 'My Day'
  const doneCount = tasksForSelectedDay.filter((task) => task.done).length

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">My Day</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>{heading}</h1>
        <button type="button" className="button" onClick={() => setAddOpen(true)}>
          <span aria-hidden="true">＋</span>
          Add Task
        </button>
      </div>

      <WeekSelector />

      <section className="panel day-list" aria-labelledby="day-list-heading">
        <h2 id="day-list-heading" className="visually-hidden">
          Tasks for {longDate(selectedDate)}
        </h2>

        {/* Announced as the day or task set changes. */}
        <p className="day-list__summary" role="status">
          {tasksForSelectedDay.length === 0
            ? `Nothing scheduled for ${longDate(selectedDate)}.`
            : `${doneCount} of ${tasksForSelectedDay.length} done on ${longDate(selectedDate)}.`}
        </p>

        {tasksForSelectedDay.length === 0 ? (
          <p className="day-list__empty">
            This day is clear. Use <strong>Add Task</strong> to schedule something.
          </p>
        ) : (
          <ul className="task-list">
            {tasksForSelectedDay.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>

      <AddTaskDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
