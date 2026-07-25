import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthProvider'
import { useCareTeam } from '../context/CareTeamProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { MemberCard } from '../components/MemberCard'
import { InviteCaregiverDialog } from '../components/InviteCaregiverDialog'

function formatInviteDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function CareTeamPage() {
  useDocumentTitle('Care Team')
  const { user } = useAuth()
  const { members, invites, resendInvite, cancelInvite } = useCareTeam()
  const { announce } = useAnnouncer()
  const [inviteOpen, setInviteOpen] = useState(false)

  const subject = user?.caringFor?.trim().split(' ')[0]
  const heading = subject ? `${subject}’s Care Team` : 'Care Team'

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">Care Team</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>{heading}</h1>
        <button type="button" className="button" onClick={() => setInviteOpen(true)}>
          <span aria-hidden="true">＋</span>
          Invite Caregiver
        </button>
      </div>

      <section aria-labelledby="team-members-heading">
        <h2 id="team-members-heading" className="visually-hidden">
          Team members
        </h2>
        <ul className="member-grid">
          {members.map((member) => (
            <li key={member.id}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      </section>

      <section className="panel invites" aria-labelledby="invites-heading">
        <div className="panel__header">
          <h2 id="invites-heading">Pending Invitations</h2>
        </div>

        {invites.length === 0 ? (
          <p className="invites__empty">No invitations are waiting. Everyone has responded.</p>
        ) : (
          <ul className="invites__list">
            {invites.map((invite) => (
              <li key={invite.id} className="invite">
                <div className="invite__who">
                  <span className="invite__icon" aria-hidden="true">
                    ✉️
                  </span>
                  <div>
                    <p className="invite__email">{invite.email}</p>
                    <p className="invite__meta">
                      Invited as {invite.role}
                      <span className="invite__sent">
                        {' '}
                        · sent {formatInviteDate(invite.invitedAt)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="invite__actions">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => {
                      resendInvite(invite.id)
                      announce(`Invitation resent to ${invite.email}.`)
                    }}
                  >
                    Resend Invitation
                    <span className="visually-hidden"> to {invite.email}</span>
                  </button>
                  <button
                    type="button"
                    className="button button--danger-text"
                    onClick={() => {
                      cancelInvite(invite.id)
                      announce(`Invitation to ${invite.email} cancelled.`)
                    }}
                  >
                    Cancel
                    <span className="visually-hidden"> invitation to {invite.email}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InviteCaregiverDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  )
}
