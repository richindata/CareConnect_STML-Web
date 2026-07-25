import { useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useIsWideLayout } from '../hooks/useMediaQuery'
import { useMail } from '../context/MailProvider'
import { ConversationList } from '../components/ConversationList'
import { MessageThread } from '../components/MessageThread'
import { ComposeDialog } from '../components/ComposeDialog'

/**
 * Mail is a master–detail layout. On tablet and desktop both panes show at
 * once. On mobile only one shows: the inbox at /mail, or the thread at
 * /mail/:id (with a back link). The `data-view` attribute drives that toggle in
 * CSS, so there is no duplicated markup for the two form factors.
 */
export function MailPage() {
  useDocumentTitle('Inbox')
  const location = useLocation()
  const [composeOpen, setComposeOpen] = useState(false)

  const viewingThread = /^\/mail\/.+/.test(location.pathname)

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">Mail</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>Inbox</h1>
      </div>

      <div className="mail-layout" data-view={viewingThread ? 'thread' : 'list'}>
        <ConversationList onCompose={() => setComposeOpen(true)} />
        <div className="mail-detail">
          <Outlet />
        </div>
      </div>

      <ComposeDialog open={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  )
}

/**
 * The index pane. On wide screens it opens the first conversation so the reading
 * pane is never empty; on mobile it renders a prompt that stays hidden behind
 * the inbox pane until a conversation is chosen.
 */
export function MailIndex() {
  const isWide = useIsWideLayout()
  const { conversations } = useMail()
  const first = conversations[0]

  if (isWide && first) {
    return <Navigate to={`/mail/${first.id}`} replace />
  }

  return (
    <section className="mail-empty panel" aria-label="No conversation selected">
      <p>Choose a conversation to read it.</p>
    </section>
  )
}

export function ConversationView() {
  const { conversationId } = useParams()
  if (!conversationId) return <MailIndex />
  return <MessageThread conversationId={conversationId} />
}
