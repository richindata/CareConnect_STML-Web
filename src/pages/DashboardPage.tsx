import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthProvider'
import {
  careTeam,
  formatLongDate,
  greetingFor,
  initialsOf,
  recentActivity,
  summaryStats,
  todaySchedule,
} from '../lib/dashboardData'

export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()

  const firstName = user?.fullName.trim().split(' ')[0] ?? 'there'
  const caringFor = user?.caringFor

  return (
    <>
      <header className="page-intro">
        <h1>
          {greetingFor()}, {firstName}
        </h1>
        <p className="page-intro__meta">
          Today is {formatLongDate()}
          {caringFor ? ` · Managing care for ${caringFor}` : null}
        </p>
      </header>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="visually-hidden">
          Today at a glance
        </h2>
        <ul className="stat-grid">
          {summaryStats.map((stat) => (
            <li key={stat.id} className="stat">
              <p className="stat__label">{stat.label}</p>
              <p className={`stat__value stat__value--${stat.tone}`}>{stat.value}</p>
              <p className="stat__detail">{stat.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="schedule-heading">
          <div className="panel__header">
            <h2 id="schedule-heading">Today&rsquo;s Schedule</h2>
            <Link className="panel__action" to="/my-day">
              Go to Daily View <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ol className="schedule">
            {todaySchedule.map((item) => (
              <li key={item.id} className={`schedule__item ${item.done ? 'is-done' : ''}`.trim()}>
                <p className="schedule__time">
                  <time>{item.time}</time>
                </p>
                <span className="schedule__marker" aria-hidden="true" />
                <div className="schedule__body">
                  <p className="schedule__title">
                    {item.title}
                    <span className="visually-hidden">
                      {item.done ? ' — completed' : ' — still to do'}
                    </span>
                  </p>
                  <p className="schedule__detail">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="dashboard-side">
          <section className="panel" aria-labelledby="team-heading">
            <div className="panel__header">
              <h2 id="team-heading">Care Team</h2>
              <Link className="panel__action" to="/settings">
                Manage
              </Link>
            </div>

            <ul className="team">
              {careTeam.map((member) => (
                <li key={member.id} className="team__member">
                  <span className={`team__avatar team__avatar--${member.tone}`} aria-hidden="true">
                    {initialsOf(member.name)}
                  </span>
                  <div>
                    <p className="team__name">{member.name}</p>
                    <p className="team__role">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel" aria-labelledby="activity-heading">
            <div className="panel__header">
              <h2 id="activity-heading">Recent Activity</h2>
            </div>

            <ul className="activity">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="activity__item">
                  <p>
                    <strong>{entry.actor}</strong> {entry.action} <strong>{entry.subject}</strong>
                  </p>
                  <p className="activity__when">{entry.when}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
