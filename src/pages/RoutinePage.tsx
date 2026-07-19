import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../context/AppDataProvider'
import { currentDayPart, dayPartLabels } from '../lib/format'
import type { DayPart } from '../lib/types'

const parts: DayPart[] = ['morning', 'afternoon', 'evening']

export function RoutinePage() {
  const { data } = useAppData()
  const activePart = currentDayPart()

  return (
    <>
      <PageHeader
        title="Your usual day"
        intro="The shape of a normal day, so you can check where you are whenever you are unsure."
      />

      {parts.map((part) => {
        const steps = data.routine.filter((step) => step.part === part)
        const headingId = `routine-${part}-heading`
        const isNow = part === activePart

        return (
          <section key={part} className="section" aria-labelledby={headingId}>
            <div className="section__header">
              <h2 id={headingId}>
                {dayPartLabels[part]}
                {isNow ? <span className="badge badge--accent"> Now</span> : null}
              </h2>
            </div>

            {steps.length === 0 ? (
              <p className="empty-state">Nothing recorded for the {part} yet.</p>
            ) : (
              <ol className="task-list">
                {steps.map((step, index) => (
                  <li key={step.id} className={`task ${isNow ? 'task--next' : ''}`.trim()}>
                    <div className="task__body">
                      <p className="task__title">
                        <span className="visually-hidden">Step {index + 1}: </span>
                        {step.title}
                      </p>
                      {step.detail ? <p className="field__hint">{step.detail}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )
      })}
    </>
  )
}
