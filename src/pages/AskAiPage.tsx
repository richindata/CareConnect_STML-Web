import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAssistant } from '../context/AssistantProvider'
import { ChatMessage } from '../components/ChatMessage'
import { SuggestedQuestions } from '../components/SuggestedQuestions'
import { AskInput } from '../components/AskInput'

export function AskAiPage() {
  useDocumentTitle('Ask AI')
  const { messages, ask } = useAssistant()
  const logRef = useRef<HTMLOListElement>(null)

  // Keep the newest turn in view as the conversation grows.
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages.length])

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">Ask AI</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>Ask AI</h1>
      </div>

      <div className="ask-layout">
        <section className="panel chat" aria-labelledby="chat-heading">
          <div className="chat__header">
            <span className="chat__avatar" aria-hidden="true">
              ✦
            </span>
            <div>
              <h2 id="chat-heading">CareConnect AI Assistant</h2>
              <p className="chat__subtitle">
                Answers come from CareConnect&rsquo;s own data — this is a demo, not a live AI.
              </p>
            </div>
          </div>

          {/* The running conversation, announced politely as replies arrive. */}
          <ol className="chat__log" ref={logRef} aria-live="polite">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </ol>

          <AskInput onSend={ask} />
        </section>

        <SuggestedQuestions onPick={ask} />
      </div>
    </>
  )
}
