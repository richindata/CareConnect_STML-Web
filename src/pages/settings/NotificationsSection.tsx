import { ToggleSwitch } from '../../components/ToggleSwitch'
import { useSettings } from '../../context/SettingsProvider'
import { useAnnouncer } from '../../context/AnnouncerProvider'
import { useAuth } from '../../context/AuthProvider'
import { useDraft } from '../../hooks/useDraft'
import { NOTIFICATION_OPTIONS } from '../../lib/settings'

export function NotificationsSection() {
  const { settings, saveSection } = useSettings()
  const { announce } = useAnnouncer()
  const { user } = useAuth()
  const { draft, setDraft, dirty } = useDraft(settings.notifications)

  const subject = user?.caringFor?.trim().split(' ')[0] ?? 'your loved one'

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveSection('notifications', draft)
    announce('Notification preferences saved.')
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby="notifications-heading">
      <header className="section-head">
        <h2 id="notifications-heading">Notification Preferences</h2>
        <p>Configure how and when you want to receive alerts about {subject}’s schedule.</p>
      </header>

      <div className="toggle-list">
        {NOTIFICATION_OPTIONS.map((option) => (
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
