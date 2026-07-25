import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import { mailSeed, nowLabel, type Conversation, type MailState, type Message } from '../lib/mail'

const STORAGE_KEY = 'careconnect.mail.v1'

interface MailValue {
  conversations: Conversation[]
  unreadCount: number
  messagesFor: (conversationId: string) => Message[]
  conversation: (conversationId: string) => Conversation | undefined
  sendMessage: (conversationId: string, text: string) => void
  markRead: (conversationId: string) => void
}

const MailContext = createContext<MailValue | null>(null)

function loadInitial(): MailState {
  const stored = readStored<Partial<MailState>>(STORAGE_KEY, {})
  return {
    conversations: stored.conversations ?? mailSeed.conversations,
    messages: stored.messages ?? mailSeed.messages,
  }
}

export function MailProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MailState>(loadInitial)

  useEffect(() => {
    writeStored(STORAGE_KEY, state)
  }, [state])

  const markRead = useCallback((conversationId: string) => {
    setState((current) => {
      const target = current.conversations.find((entry) => entry.id === conversationId)
      if (!target || !target.unread) return current
      return {
        ...current,
        conversations: current.conversations.map((entry) =>
          entry.id === conversationId ? { ...entry, unread: false } : entry,
        ),
      }
    })
  }, [])

  const value = useMemo<MailValue>(() => {
    return {
      conversations: state.conversations,
      unreadCount: state.conversations.filter((entry) => entry.unread).length,

      messagesFor: (conversationId) =>
        state.messages.filter((message) => message.conversationId === conversationId),

      conversation: (conversationId) =>
        state.conversations.find((entry) => entry.id === conversationId),

      sendMessage: (conversationId, text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        const message: Message = {
          id: createId('m'),
          conversationId,
          from: 'me',
          senderName: 'You',
          text: trimmed,
          timeLabel: nowLabel(),
        }
        setState((current) => ({
          messages: [...current.messages, message],
          conversations: current.conversations.map((entry) =>
            entry.id === conversationId
              ? { ...entry, preview: trimmed, updatedLabel: 'Now', unread: false }
              : entry,
          ),
        }))
      },

      markRead,
    }
  }, [state, markRead])

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>
}

export function useMail(): MailValue {
  const context = useContext(MailContext)
  if (!context) throw new Error('useMail must be used inside <MailProvider>')
  return context
}
