import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Dialog } from '../components/Dialog'
import { usePreferences } from '../context/PreferencesProvider'
import { useAppData } from '../context/AppDataProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import type { Preferences } from '../lib/types'

interface RadioGroupProps<K extends keyof Preferences> {
  legend: string
  hint?: string
  name: K
  value: Preferences[K]
  options: { value: Preferences[K]; label: string }[]
  onChange: (value: Preferences[K]) => void
}

/**
 * A native radio group in a <fieldset>/<legend>. Arrow keys move between
 * options and the legend is read as the group name — no ARIA required.
 */
function RadioGroup<K extends keyof Preferences>({
  legend,
  hint,
  name,
  value,
  options,
  onChange,
}: RadioGroupProps<K>) {
  const hintId = hint ? `${name}-hint` : undefined

  return (
    <fieldset className="fieldset" aria-describedby={hintId}>
      <legend>{legend}</legend>
      {hint ? (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      ) : null}
      {options.map((option) => {
        const id = `${name}-${String(option.value)}`
        return (
          <span key={id} className="radio-row">
            <input
              type="radio"
              id={id}
              name={String(name)}
              value={String(option.value)}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={id}>{option.label}</label>
          </span>
        )
      })}
    </fieldset>
  )
}

export function SettingsPage() {
  const { preferences, setPreference, resetPreferences } = usePreferences()
  const { resetToSeed } = useAppData()
  const { announce } = useAnnouncer()
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="Settings"
        intro="Make CareConnect easier to read and use. Changes apply straight away and are remembered on this device."
      />

      <div className="card-grid">
        <RadioGroup
          legend="Colours"
          hint="“Match my device” follows your system light or dark setting."
          name="theme"
          value={preferences.theme}
          options={[
            { value: 'system', label: 'Match my device' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          onChange={(value) => {
            setPreference('theme', value)
            announce(`Colours set to ${value === 'system' ? 'match my device' : value}.`)
          }}
        />

        <RadioGroup
          legend="Text size"
          name="textSize"
          value={preferences.textSize}
          options={[
            { value: 'default', label: 'Normal' },
            { value: 'large', label: 'Large' },
            { value: 'x-large', label: 'Extra large' },
          ]}
          onChange={(value) => {
            setPreference('textSize', value)
            announce(`Text size set to ${value === 'x-large' ? 'extra large' : value}.`)
          }}
        />

        <RadioGroup
          legend="Contrast"
          hint="Higher contrast makes edges and text stronger against the background."
          name="contrast"
          value={preferences.contrast}
          options={[
            { value: 'default', label: 'Normal' },
            { value: 'high', label: 'High contrast' },
          ]}
          onChange={(value) => {
            setPreference('contrast', value)
            announce(`Contrast set to ${value}.`)
          }}
        />

        <fieldset className="fieldset">
          <legend>Movement</legend>
          <p className="field__hint">
            CareConnect already follows your device&rsquo;s “reduce motion” setting. Turn this on to
            reduce animation regardless.
          </p>
          <span className="checkbox-row">
            <input
              id="reduce-motion"
              type="checkbox"
              checked={preferences.reduceMotion}
              onChange={(event) => {
                setPreference('reduceMotion', event.target.checked)
                announce(event.target.checked ? 'Reduced motion on.' : 'Reduced motion off.')
              }}
            />
            <label htmlFor="reduce-motion">Reduce animation and movement</label>
          </span>
        </fieldset>
      </div>

      <section className="section" aria-labelledby="data-heading">
        <h2 id="data-heading">Your information</h2>
        <div className="card stack">
          <p>
            Reminders, notes, and contacts are stored only in this browser on this device. Nothing
            is sent anywhere, and CareConnect works with no internet connection.
          </p>
          <div className="button-row">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                resetPreferences()
                announce('Display settings restored to their defaults.')
              }}
            >
              Reset display settings
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => setResetOpen(true)}
            >
              Reset all content
            </button>
          </div>
        </div>
      </section>

      <Dialog
        open={resetOpen}
        title="Reset all content?"
        description="Your reminders, routine, people, and notes will be replaced with the example day CareConnect started with."
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setResetOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => {
                resetToSeed()
                setResetOpen(false)
                announce('All content has been reset to the example day.')
              }}
            >
              Yes, reset everything
            </button>
          </>
        }
      >
        <p>This cannot be undone.</p>
      </Dialog>
    </>
  )
}
