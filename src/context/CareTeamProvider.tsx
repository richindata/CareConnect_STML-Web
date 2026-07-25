import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import { careTeamSeed, type CareTeamState } from '../lib/careTeam'

const STORAGE_KEY = 'careconnect.careteam.v1'

interface InviteInput {
  email: string
  role: string
}

interface CareTeamValue extends CareTeamState {
  inviteCaregiver: (input: InviteInput) => void
  resendInvite: (id: string) => void
  cancelInvite: (id: string) => void
}

const CareTeamContext = createContext<CareTeamValue | null>(null)

function loadInitial(): CareTeamState {
  const stored = readStored<Partial<CareTeamState>>(STORAGE_KEY, {})
  return {
    members: stored.members ?? careTeamSeed.members,
    invites: stored.invites ?? careTeamSeed.invites,
  }
}

export function CareTeamProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CareTeamState>(loadInitial)

  // Persist so invitations survive a reload and are available offline.
  useEffect(() => {
    writeStored(STORAGE_KEY, state)
  }, [state])

  const value = useMemo<CareTeamValue>(
    () => ({
      ...state,

      inviteCaregiver: ({ email, role }) =>
        setState((current) => {
          const normalised = email.trim().toLowerCase()
          // An invite to an address that already has one just refreshes it,
          // rather than stacking duplicates.
          const existing = current.invites.find((invite) => invite.email === normalised)
          if (existing) {
            return {
              ...current,
              invites: current.invites.map((invite) =>
                invite.id === existing.id
                  ? { ...invite, role, invitedAt: new Date().toISOString() }
                  : invite,
              ),
            }
          }
          return {
            ...current,
            invites: [
              ...current.invites,
              { id: createId('inv'), email: normalised, role, invitedAt: new Date().toISOString() },
            ],
          }
        }),

      resendInvite: (id) =>
        setState((current) => ({
          ...current,
          invites: current.invites.map((invite) =>
            invite.id === id ? { ...invite, invitedAt: new Date().toISOString() } : invite,
          ),
        })),

      cancelInvite: (id) =>
        setState((current) => ({
          ...current,
          invites: current.invites.filter((invite) => invite.id !== id),
        })),
    }),
    [state],
  )

  return <CareTeamContext.Provider value={value}>{children}</CareTeamContext.Provider>
}

export function useCareTeam(): CareTeamValue {
  const context = useContext(CareTeamContext)
  if (!context) throw new Error('useCareTeam must be used inside <CareTeamProvider>')
  return context
}
