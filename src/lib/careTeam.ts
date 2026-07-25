export type MemberStatus = 'active' | 'offline'

/** Colour families for the avatar + role badge, kept in sync with the CSS. */
export type Tone = 'primary' | 'nurse' | 'family' | 'aide' | 'clinician'

export interface TeamMember {
  id: string
  name: string
  role: string
  tone: Tone
  phone: string
  email: string
  status: MemberStatus
  /** Free text under the status dot, e.g. "Checked in 2 hrs ago". */
  statusNote: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  /** ISO timestamp of when the invite was last sent. */
  invitedAt: string
}

export interface CareTeamState {
  members: TeamMember[]
  invites: PendingInvite[]
}

/** The roles offered in the invite form; the first is the default selection. */
export const CARE_ROLES = [
  'Registered Nurse',
  'Family Member',
  'Home Health Aide',
  'Geriatrician',
  'Physical Therapist',
  'Primary Caregiver',
] as const

/** Maps a role to an avatar/badge tone, defaulting to the clinician palette. */
export function toneForRole(role: string): Tone {
  const normalised = role.toLowerCase()
  if (normalised.includes('primary')) return 'primary'
  if (normalised.includes('nurse')) return 'nurse'
  if (normalised.includes('family')) return 'family'
  if (normalised.includes('aide')) return 'aide'
  return 'clinician'
}

export const careTeamSeed: CareTeamState = {
  members: [
    {
      id: 'ctm-sarah',
      name: 'Sarah Chen',
      role: 'Primary Caregiver',
      tone: 'primary',
      phone: '+1 (555) 432-8765',
      email: 'sarah.chen@careconnect.com',
      status: 'active',
      statusNote: 'Current Session',
    },
    {
      id: 'ctm-jenny',
      name: 'Jenny Williams',
      role: 'Registered Nurse',
      tone: 'nurse',
      phone: '+1 (555) 987-6543',
      email: 'jenny.w@careconnect.com',
      status: 'active',
      statusNote: 'Checked in 2 hrs ago',
    },
    {
      id: 'ctm-michael',
      name: 'Michael Chen',
      role: 'Family Member',
      tone: 'family',
      phone: '+1 (555) 234-5678',
      email: 'michael.c@careconnect.com',
      status: 'offline',
      statusNote: 'Yesterday at 5:00 PM',
    },
    {
      id: 'ctm-rosa',
      name: 'Rosa Gutierrez',
      role: 'Home Health Aide',
      tone: 'aide',
      phone: '+1 (555) 876-5432',
      email: 'rosa.g@careconnect.com',
      status: 'offline',
      statusNote: 'Oct 12 at 4:30 PM',
    },
  ],
  invites: [
    {
      id: 'inv-robert',
      email: 'dr.robert.martinez@clinic.com',
      role: 'Geriatrician',
      invitedAt: '2026-07-20T14:00:00.000Z',
    },
  ],
}

/** Strips formatting so digits are safe inside a tel: URL. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
