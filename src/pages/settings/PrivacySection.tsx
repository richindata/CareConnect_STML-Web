import { ToggleSwitch } from '../../components/ToggleSwitch'
import { useSettings } from '../../context/SettingsProvider'
import { useAnnouncer } from '../../context/AnnouncerProvider'
import { useDraft } from '../../hooks/useDraft'
import { PRIVACY_OPTIONS } from '../../lib/settings'

export function PrivacySection() {
  const { settings, saveSection } = useSettings()
  const { announce } = useAnnouncer()
  const { draft, setDraft, dirty } = useDraft(settings.privacy)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveSection('privacy', draft)
    announce('Privacy preferences saved.')
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="privacy-heading">
      <header className="section-head">
        <h2 id="privacy-heading">Privacy</h2>
        <p>Control what the care team can see and how your data is used.</p>
      </header>

      <div className="toggle-list">
        {PRIVACY_OPTIONS.map((option) => (
          <ToggleSwitch
            key={option.key}
            label={option.label}
            description={option.description}
            checked={draft[option.key]}
            onChange={(checked) => setDraft((current) => ({ ...current, [option.key]: checked }))}
          />
        ))}
      </div>

      <div className="section-actions">
        <button type="submit" className="button" aria-disabled={!dirty}>
          Save Changes
        </button>
        {dirty ? <span className="section-actions__hint">Unsaved changes</span> : null}
      </div>
    </form>
  )
}
