import { initialsOf } from '../lib/dashboardData'
import { telHref, type TeamMember } from '../lib/careTeam'

/** One caregiver, rendered as an <article> so each card is its own region. */
export function MemberCard({ member }: { member: TeamMember }) {
  const statusLabel = member.status === 'active' ? 'Active Now' : 'Offline'

  return (
    <article className="member" aria-labelledby={`${member.id}-name`}>
      <div className="member__head">
        <span className={`member__avatar member__avatar--${member.tone}`} aria-hidden="true">
          {initialsOf(member.name)}
        </span>
        <div>
          <h3 id={`${member.id}-name`} className="member__name">
            {member.name}
          </h3>
          <p className={`badge badge--${member.tone}`}>{member.role}</p>
        </div>
      </div>

      <dl className="member__contact">
        <div className="member__row">
          <dt>
            <span aria-hidden="true">📞</span>
            <span className="visually-hidden">Phone</span>
          </dt>
          <dd>
            <a href={telHref(member.phone)}>{member.phone}</a>
          </dd>
        </div>
        <div className="member__row">
          <dt>
            <span aria-hidden="true">✉️</span>
            <span className="visually-hidden">Email</span>
          </dt>
          <dd>
            <a href={`mailto:${member.email}`}>{member.email}</a>
          </dd>
        </div>
      </dl>

      <p className="member__status">
        <span className={`member__dot member__dot--${member.status}`} aria-hidden="true" />
        <span className="member__status-label">{statusLabel}</span>
        <span className="member__status-note">{member.statusNote}</span>
      </p>
    </article>
  )
}
