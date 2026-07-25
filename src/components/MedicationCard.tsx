import { useMeds } from '../context/MedsProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { isDoseTaken, type Medication } from '../lib/meds'
import { formatTime } from '../lib/myDay'

interface MedicationCardProps {
  med: Medication
  onRemove: (med: Medication) => void
}

/** One medication, with a checkable dose for each scheduled time today. */
export function MedicationCard({ med, onRemove }: MedicationCardProps) {
  const { toggleDose } = useMeds()
  const { announce } = useAnnouncer()

  const takenCount = med.times.filter((time) => isDoseTaken(med, time)).length
  const allTaken = takenCount === med.times.length

  return (
    <article className={`med ${allTaken ? 'is-complete' : ''}`.trim()} aria-labelledby={`${med.id}-name`}>
      <div className="med__head">
        <span className="med__icon" aria-hidden="true">
          💊
        </span>
        <div className="med__title">
          <h3 id={`${med.id}-name`} className="med__name">
            {med.name}
          </h3>
          <p className="med__dosage">{med.dosage}</p>
        </div>
        <button
          type="button"
          className="button button--danger-text med__remove"
          onClick={() => onRemove(med)}
        >
          <span aria-hidden="true">🗑</span>
          <span className="visually-hidden">Remove {med.name}</span>
        </button>
      </div>

      {med.instructions ? <p className="med__instructions">{med.instructions}</p> : null}

      <fieldset className="med__doses">
        <legend className="med__doses-legend">
          Today&rsquo;s doses
          <span className="med__count">
            {takenCount}/{med.times.length} taken
          </span>
        </legend>

        <ul className="dose-list">
          {med.times.map((time) => {
            const taken = isDoseTaken(med, time)
            const inputId = `${med.id}-${time}`
            return (
              <li key={time} className={`dose ${taken ? 'is-taken' : ''}`.trim()}>
                <input
                  type="checkbox"
                  id={inputId}
                  className="dose__check"
                  checked={taken}
                  onChange={() => {
                    toggleDose(med.id, time)
                    announce(
                      taken
                        ? `${med.name} at ${formatTime(time)} marked as not taken.`
                        : `${med.name} at ${formatTime(time)} marked as taken.`,
                    )
                  }}
                />
                <label htmlFor={inputId}>
                  <span className="dose__time">
                    <time dateTime={time}>{formatTime(time)}</time>
                  </span>
                  <span className={`dose__state ${taken ? 'is-taken' : ''}`.trim()}>
                    {taken ? 'Taken' : 'Due'}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>
    </article>
  )
}
