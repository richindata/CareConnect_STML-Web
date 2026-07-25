import { useMyDay } from '../context/MyDayProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { formatTime, type Task } from '../lib/myDay'

/**
 * One scheduled task. The done state is a native checkbox with a real label,
 * so it is focusable, toggles with Space, and reports its state without ARIA.
 */
export function TaskRow({ task }: { task: Task }) {
  const { toggleTask } = useMyDay()
  const { announce } = useAnnouncer()
  const inputId = `task-${task.id}`

  const handleToggle = () => {
    toggleTask(task.id)
    announce(
      task.done
        ? `${task.title} marked as pending.`
        : `${task.title} marked as completed. Well done.`,
    )
  }

  return (
    <li className={`task-row ${task.done ? 'is-done' : 'is-pending'}`}>
      <p className="task-row__time">
        <time dateTime={task.time}>{formatTime(task.time)}</time>
      </p>

      <input
        type="checkbox"
        id={inputId}
        className="task-row__check"
        checked={task.done}
        onChange={handleToggle}
      />

      <div className="task-row__body">
        <label className="task-row__title" htmlFor={inputId}>
          {task.title}
        </label>
        <p className="task-row__assignee">
          Assigned: <strong>{task.assignee}</strong>
        </p>
      </div>

      <span className={`status-pill status-pill--${task.done ? 'done' : 'pending'}`}>
        {task.done ? 'Completed' : 'Pending'}
      </span>
    </li>
  )
}
