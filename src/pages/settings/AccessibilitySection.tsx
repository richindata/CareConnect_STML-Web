import { ToggleSwitch } from '../../components/ToggleSwitch'
import { useSettings } from '../../context/SettingsProvider'
import { useAnnouncer } from '../../context/AnnouncerProvider'
import { ACCESSIBILITY_OPTIONS } from '../../lib/settings'

/**
 * Accessibility toggles apply immediately — there is no Save button, because a
 * person adjusting these wants to see the effect at once, and each change is
 * persisted and announced on the spot.
 */
export function AccessibilitySection() {
  const { settings, saveSection } = useSettings()
  const { announce } = useAnnouncer()

  return (
    <section aria-labelledby="accessibility-heading">
      <header className="section-head">
        <h2 id="accessibility-heading">Accessibility</h2>
        <p>These take effect straight away and are remembered on this device.</p>
      </header>

      <div className="toggle-list">
        {ACCESSIBILITY_OPTIONS.map((option) => (
          <ToggleSwitch
            key={option.key}
            label={option.label}
            description={option.description}
            checked={settings.accessibility[option.key]}
            onChange={(checked) => {
              saveSection('accessibility', { ...settings.accessibility, [option.key]: checked })
              announce(`${option.label} ${checked ? 'on' : 'off'}.`)
            }}
          />
        ))}
      </div>
    </section>
  )
}
