import { useMyDay } from '../context/MyDayProvider'
import { dateKey, shortWeekday, todayKey, weekOf } from '../lib/myDay'

/**
 * A horizontally-scrolling strip of the seven days in the selected week. Each
 * day is a button with `aria-pressed`, grouped and labelled so a screen reader
 * announces it as a set of day choices.
 */
export function WeekSelector() {
  const { selectedDate, selectDate } = useMyDay()
  const days = weekOf(new Date(`${selectedDate}T00:00:00`))
  const today = todayKey()

  return (
    <div className="week" role="group" aria-label="Choose a day">
      {days.map((day) => {
        const key = dateKey(day)
        const isSelected = key === selectedDate
        const isToday = key === today
        return (
          <button
            key={key}
            type="button"
            className={`week__day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`.trim()}
            aria-pressed={isSelected}
            onClick={() => selectDate(key)}
          >
            <span className="week__name">{shortWeekday(day)}</span>
            <span className="week__num">{day.getDate()}</span>
            {isToday ? <span className="visually-hidden"> (today)</span> : null}
          </button>
        )
      })}
    </div>
  )
}
