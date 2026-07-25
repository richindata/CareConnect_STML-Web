import { NavLink } from 'react-router-dom'
import { useMail } from '../context/MailProvider'
import { initialsOf } from '../lib/mail'

interface ConversationListProps {
  onCompose: () => void
}

/** The inbox pane: a labelled list of conversations as NavLinks. */
export function ConversationList({ onCompose }: ConversationListProps) {
  const { conversations } = useMail()

  return (
    <section className="mail-list panel" aria-labelledby="mail-list-heading">
      <div className="mail-list__head">
        <h2 id="mail-list-heading">Recent Conversations</h2>
        <button type="button" className="mail-list__compose" onClick={onCompose}>
          <span aria-hidden="true">✎</span>
          <span className="visually-hidden">New message</span>
        </button>
      </div>

      <ul className="mail-list__items">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <NavLink className="conv" to={`/mail/${conversation.id}`}>
              <span className="conv__avatar" aria-hidden="true">
                {initialsOf(conversation.name)}
              </span>
              <span className="conv__body">
                <span className="conv__top">
                  <span className="conv__name">{conversation.name}</span>
                  <span className="conv__time">{conversation.updatedLabel}</span>
                </span>
                <span className="conv__topic">{conversation.topic}</span>
                <span className="conv__preview">{conversation.preview}</span>
              </span>
              {conversation.unread ? (
                <span className="conv__unread" aria-hidden="true" />
              ) : null}
              {conversation.unread ? (
                <span className="visually-hidden">Unread</span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
