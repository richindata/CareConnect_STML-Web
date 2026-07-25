import { useId } from 'react'

interface ToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * A label + description row with an accessible switch. Built on a native
 * checkbox styled as a switch, so it is keyboard-operable (Space toggles),
 * announces its checked state, and needs no extra ARIA wiring beyond the
 * description association.
 */
export function ToggleSwitch({ label, description, checked, onChange }: ToggleSwitchProps) {
  const id = useId()
  const descriptionId = description ? `${id}-desc` : undefined

  return (
    <div className="toggle-row">
      <div className="toggle-row__text">
        <label className="toggle-row__label" htmlFor={id}>
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="toggle-row__desc">
            {description}
          </p>
        ) : null}
      </div>

      <input
        type="checkbox"
        id={id}
        className="switch"
        role="switch"
        checked={checked}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  )
}
