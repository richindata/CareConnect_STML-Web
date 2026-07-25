import type { SleepDay } from '../lib/assistant'

interface SleepChartProps {
  days: SleepDay[]
  averageHours: number
}

/**
 * A single-series bar chart of sleep hours. The bars are decorative
 * (`aria-hidden`); the real data lives in a visually-hidden table so screen
 * readers get exact values. The anomaly night is marked with a label and icon,
 * never colour alone (its amber fill fails 3:1 against the surface on its own).
 */
export function SleepChart({ days, averageHours }: SleepChartProps) {
  const max = Math.max(...days.map((day) => day.hours), 8)

  return (
    <figure className="sleep-chart">
      <figcaption className="sleep-chart__caption">
        Sleep duration, last 7 days · average {averageHours} h
      </figcaption>

      <div className="sleep-chart__plot" aria-hidden="true">
        {days.map((day) => (
          <div key={day.label} className="sleep-chart__col">
            <span className="sleep-chart__value">{day.hours}</span>
            <span
              className={`sleep-chart__bar ${day.anomaly ? 'is-anomaly' : ''}`.trim()}
              style={{ height: `${(day.hours / max) * 100}%` }}
            />
            <span className="sleep-chart__label">
              {day.label}
              {day.anomaly ? <span className="sleep-chart__flag"> ▲</span> : null}
            </span>
          </div>
        ))}
      </div>

      <table className="visually-hidden">
        <caption>Sleep duration in hours for the last seven days</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Hours</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.label}>
              <th scope="row">{day.label}</th>
              <td>{day.hours}</td>
              <td>{day.anomaly ? 'Short / restless' : 'Typical'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {days.some((day) => day.anomaly) ? (
        <p className="sleep-chart__note">▲ marks a shorter, more restless night.</p>
      ) : null}
    </figure>
  )
}
