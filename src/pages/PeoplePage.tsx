import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Dialog } from '../components/Dialog'
import { useAppData } from '../context/AppDataProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { initialsOf, telHref } from '../lib/format'
import type { Person } from '../lib/types'

export function PeoplePage() {
  const { data, addPerson, removePerson } = useAppData()
  const { announce } = useAnnouncer()

  const [addOpen, setAddOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null)

  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [isEmergency, setIsEmergency] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  // Emergency contacts first, then alphabetical — the order someone in
  // difficulty needs, not the order they were entered.
  const ordered = useMemo(
    () =>
      [...data.people].sort((a, b) => {
        if (a.isEmergencyContact !== b.isEmergencyContact) return a.isEmergencyContact ? -1 : 1
        return a.name.localeCompare(b.name)
      }),
    [data.people],
  )

  const closeAdd = () => {
    setAddOpen(false)
    setName('')
    setRelationship('')
    setPhone('')
    setIsEmergency(false)
    setErrors({})
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Please enter the person’s name.'
    if (!phone.trim()) nextErrors.phone = 'Please enter a phone number so they can be called.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(nextErrors.name ? 'person-name' : 'person-phone')?.focus()
      return
    }

    addPerson({
      name: name.trim(),
      relationship: relationship.trim() || 'Contact',
      phone: phone.trim(),
      isEmergencyContact: isEmergency,
    })
    announce(`${name.trim()} added to your people.`)
    closeAdd()
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    removePerson(pendingDelete.id)
    announce(`${pendingDelete.name} removed.`)
    setPendingDelete(null)
  }

  return (
    <>
      <PageHeader
        title="People you can call"
        intro="Tap or press Enter on a name to start a phone call. The person to call first is at the top."
        actions={
          <button type="button" className="button" onClick={() => setAddOpen(true)}>
            <span aria-hidden="true">＋</span>
            Add a person
          </button>
        }
      />

      {ordered.length === 0 ? (
        <p className="empty-state">No people saved yet.</p>
      ) : (
        <ul className="card-grid">
          {ordered.map((person) => (
            <li key={person.id} className="card">
              <article className="person">
                <p className="person__avatar" aria-hidden="true">
                  {initialsOf(person.name)}
                </p>
                <div>
                  <h2>
                    {person.name}{' '}
                    {person.isEmergencyContact ? (
                      <span className="badge badge--danger">Call first</span>
                    ) : null}
                  </h2>
                  <p className="person__relationship">{person.relationship}</p>
                </div>

                <p className="button-row">
                  <a className="button" href={telHref(person.phone)}>
                    <span aria-hidden="true">📞</span>
                    Call
                    <span className="visually-hidden">
                      {' '}
                      {person.name} on {person.phone}
                    </span>
                  </a>
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => setPendingDelete(person)}
                  >
                    Remove
                    <span className="visually-hidden"> {person.name}</span>
                  </button>
                </p>

                <p className="field__hint">{person.phone}</p>
              </article>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={addOpen} title="Add a person" onClose={closeAdd}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="person-name">Name</label>
            <input
              id="person-name"
              type="text"
              value={name}
              autoComplete="name"
              required
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'person-name-error' : undefined}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? (
              <p id="person-name-error" className="field__error">
                <span aria-hidden="true">⚠</span>
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="person-relationship">How do you know them? (optional)</label>
            <input
              id="person-relationship"
              type="text"
              value={relationship}
              autoComplete="off"
              aria-describedby="person-relationship-hint"
              onChange={(event) => setRelationship(event.target.value)}
            />
            <p id="person-relationship-hint" className="field__hint">
              For example “Daughter”, “Neighbour”, or “Community nurse”.
            </p>
          </div>

          <div className="field">
            <label htmlFor="person-phone">Phone number</label>
            <input
              id="person-phone"
              type="tel"
              value={phone}
              autoComplete="tel"
              required
              aria-invalid={errors.phone ? 'true' : undefined}
              aria-describedby={errors.phone ? 'person-phone-error' : undefined}
              onChange={(event) => setPhone(event.target.value)}
            />
            {errors.phone ? (
              <p id="person-phone-error" className="field__error">
                <span aria-hidden="true">⚠</span>
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div className="field">
            <span className="checkbox-row">
              <input
                id="person-emergency"
                type="checkbox"
                checked={isEmergency}
                onChange={(event) => setIsEmergency(event.target.checked)}
              />
              <label htmlFor="person-emergency">Show this person first, for emergencies</label>
            </span>
          </div>

          <div className="dialog__footer">
            <button type="button" className="button button--secondary" onClick={closeAdd}>
              Cancel
            </button>
            <button type="submit" className="button">
              Save person
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        title="Remove this person?"
        description={
          pendingDelete ? `${pendingDelete.name} will no longer appear in your list.` : undefined
        }
        onClose={() => setPendingDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setPendingDelete(null)}
            >
              Keep them
            </button>
            <button type="button" className="button button--danger" onClick={confirmDelete}>
              Yes, remove
            </button>
          </>
        }
      >
        <p>You can add them again at any time.</p>
      </Dialog>
    </>
  )
}
