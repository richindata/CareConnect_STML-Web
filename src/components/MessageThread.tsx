import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useMail } from '../context/MailProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { MessageComposer } from './MessageComposer'

/** The reading pane: header, the message list, and the reply composer. */
export function MessageThread({ conversationId }: { conversationId: string }) {
  const { conversation, messagesFor, sendMessage, markRead } = useMail()
  const { announce } = useAnnouncer()
  const logRef = useRef<HTMLOListElement>(null)

  const convo = conversation(conversationId)
  const messages = messagesFor(conversationId)

  // Opening a conversation clears its unread flag.
  useEffect(() => {
    markRead(conversationId)
  }, [conversationId, markRead])

  // Keep the latest message in view.
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages.length])

  if (!convo) {
    return (
      <section className="mail-thread panel" aria-labelledby="thread-missing">
        <h2 id="thread-missing">Conversation not found</h2>
        <p>
          That conversation isn’t here. <Link to="/mail">Back to the inbox</Link>.
        </p>
      </section>
    )
  }

  return (
    <section className="mail-thread panel" aria-labelledby="thread-heading">
      <header className="thread-head">
        <Link className="thread-head__back" to="/mail">
          <span aria-hidden="true">←</span> Inbox
        </Link>
        <div className="thread-head__title">
          <h2 id="thread-heading">{convo.name}</h2>
          <p className="thread-head__topic">Topic: {convo.topic}</p>
        </div>
        <span className="badge badge--primary">{convo.role}</span>
      </header>

      <ol className="thread-log" ref={logRef}>
        {messages.map((message) => (
          <li key={message.id} className={`bubble bubble--${message.from === 'me' ? 'me' : 'them'}`}>
            <p className="bubble__meta">
              {message.senderName} · <time>{message.timeLabel}</time>
            </p>
            <p className="bubble__text">
              <span className="visually-hidden">
                {message.from === 'me' ? 'You wrote: ' : `${message.senderName} wrote: `}
              </span>
              {message.text}
            </p>
          </li>
        ))}
      </ol>

      <MessageComposer
        onSend={(text) => {
          sendMessage(conversationId, text)
          announce('Message sent.')
        }}
      />
    </section>
  )
}
