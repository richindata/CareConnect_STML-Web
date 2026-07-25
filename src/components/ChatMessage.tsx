import { SleepChart } from './SleepChart'
import { formatTime } from '../lib/myDay'
import type { Message, Widget } from '../lib/assistant'

function WidgetView({ widget }: { widget: Widget }) {
  switch (widget.kind) {
    case 'meds':
      return (
        <ul className="chat-widget chat-widget--list">
          {widget.items.map((item) => (
            <li key={`${item.name}-${item.time}`}>
              <span className={`chat-dot chat-dot--${item.taken ? 'done' : 'due'}`} aria-hidden="true" />
              <strong>{item.name}</strong> {item.dosage} — {formatTime(item.time)}{' '}
              <span className="chat-widget__muted">{item.taken ? '(taken)' : '(scheduled)'}</span>
            </li>
          ))}
        </ul>
      )
    case 'careTeam':
      return (
        <ul className="chat-widget chat-widget--list">
          {widget.members.map((member) => (
            <li key={member.name}>
              <strong>{member.name}</strong> — {member.role}{' '}
              <span className="chat-widget__muted">· {member.status}</span>
            </li>
          ))}
        </ul>
      )
    case 'appointments':
      return (
        <ul className="chat-widget chat-widget--list">
          {widget.items.map((item) => (
            <li key={`${item.title}-${item.time}`}>
              <strong>{item.title}</strong> — {formatTime(item.time)}{' '}
              <span className="chat-widget__muted">with {item.assignee}</span>
            </li>
          ))}
        </ul>
      )
    case 'sleep':
      return <SleepChart days={widget.days} averageHours={widget.averageHours} />
    default:
      return null
  }
}

/** One chat turn. User turns align right; assistant turns left with an avatar. */
export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <li className={`chat-msg chat-msg--${isUser ? 'user' : 'assistant'}`}>
      {!isUser ? (
        <span className="chat-msg__avatar" aria-hidden="true">
          ✦
        </span>
      ) : null}

      <div className="chat-msg__bubble">
        <span className="visually-hidden">{isUser ? 'You said: ' : 'Assistant replied: '}</span>
        <p className="chat-msg__text">{message.text}</p>
        {message.widget ? <WidgetView widget={message.widget} /> : null}
      </div>
    </li>
  )
}
