import { useState } from 'react'
import { Dialog } from './Dialog'
import { useMyDay } from '../context/MyDayProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { KNOWN_ASSIGNEES, longDate } from '../lib/myDay'

interface AddTaskDialogProps {
  open: boolean
  onClose: () => void
}

interface FieldErrors {
  title?: string
  time?: string
}

export function AddTaskDialog({ open, onClose }: AddTaskDialogProps) {
  const { selectedDate, addTask } = useMyDay()
  const { announce } = useAnnouncer()

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [assignee, setAssignee] = useState<string>(KNOWN_ASSIGNEES[0])
  const [errors, setErrors] = useState<FieldErrors>({})

  const reset = () => {
    setTitle('')
    setTime('09:00')
    setAssignee(KNOWN_ASSIGNEES[0])
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: FieldErrors = {}
    if (!title.trim()) next.title = 'Give the task a name, for example “Afternoon walk”.'
    if (!time) next.time = 'Choose a time.'

    setErrors(next)
    if (next.title || next.time) {
      document.getElementById(next.title ? 'task-title' : 'task-time')?.focus()
      announce('There is a problem with the form.')
      return
    }

    addTask({ title: title.trim(), time, assignee, date: selectedDate })
    announce(`Task added: ${title.trim()}.`)
    close()
  }

  return (
    <Dialog
      open={open}
      title="Add Task"
      description={`It will be added to ${longDate(selectedDate)}.`}
      onClose={close}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="task-title">
            Task <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            autoComplete="off"
            placeholder="Afternoon walk"
            required
            value={title}
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            onChange={(event) => {
              setTitle(event.target.value)
              if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
            }}
          />
          {errors.title ? (
            <p id="task-title-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="task-time">
            Time <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="task-time"
            type="time"
            required
            value={time}
            aria-invalid={errors.time ? 'true' : undefined}
            aria-describedby={errors.time ? 'task-time-error' : undefined}
            onChange={(event) => {
              setTime(event.target.value)
              if (errors.time) setErrors((current) => ({ ...current, time: undefined }))
            }}
          />
          {errors.time ? (
            <p id="task-time-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.time}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="task-assignee">Assigned to</label>
          <select
            id="task-assignee"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
          >
            {KNOWN_ASSIGNEES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="dialog__footer">
          <button type="button" className="button button--secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="button">
            Add Task
          </button>
        </div>
      </form>
    </Dialog>
  )
}
