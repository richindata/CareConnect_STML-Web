import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import { generateReply, type Message } from '../lib/assistant'
import { useAuth } from './AuthProvider'
import { useMeds } from './MedsProvider'
import { useMyDay } from './MyDayProvider'
import { useCareTeam } from './CareTeamProvider'

const STORAGE_KEY = 'careconnect.assistant.v1'

interface AssistantValue {
  messages: Message[]
  ask: (prompt: string) => void
  clear: () => void
}

const AssistantContext = createContext<AssistantValue | null>(null)

function greeting(subject: string): Message {
  return {
    id: 'msg-intro',
    role: 'assistant',
    at: new Date(0).toISOString(),
    text:
      `Hello — I’m the CareConnect assistant. Ask me about ${subject}’s care plan, ` +
      `medications, schedule, or recent patterns. I answer from CareConnect’s own data, ` +
      `not a live AI.`,
  }
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { medications } = useMeds()
  const { tasks } = useMyDay()
  const { members } = useCareTeam()

  const subject = user?.caringFor?.trim().split(' ')[0] ?? 'your loved one'

  const [messages, setMessages] = useState<Message[]>(
    () => readStored<Message[] | null>(STORAGE_KEY, null) ?? [greeting(subject)],
  )

  useEffect(() => {
    writeStored(STORAGE_KEY, messages)
  }, [messages])

  const value = useMemo<AssistantValue>(
    () => ({
      messages,

      ask: (prompt) => {
        const trimmed = prompt.trim()
        if (!trimmed) return

        const userMessage: Message = {
          id: createId('msg'),
          role: 'user',
          text: trimmed,
          at: new Date().toISOString(),
        }
        const reply = generateReply(trimmed, { subject, medications, tasks, team: members })
        const assistantMessage: Message = {
          id: createId('msg'),
          role: 'assistant',
          text: reply.text,
          at: new Date().toISOString(),
          widget: reply.widget,
        }
        setMessages((current) => [...current, userMessage, assistantMessage])
      },

      clear: () => setMessages([greeting(subject)]),
    }),
    [messages, subject, medications, tasks, members],
  )

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant(): AssistantValue {
  const context = useContext(AssistantContext)
  if (!context) throw new Error('useAssistant must be used inside <AssistantProvider>')
  return context
}
