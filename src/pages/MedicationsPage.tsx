import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthProvider'
import { useMeds } from '../context/MedsProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { MedicationCard } from '../components/MedicationCard'
import { AddMedicationDialog } from '../components/AddMedicationDialog'
import { Dialog } from '../components/Dialog'
import { formatTime } from '../lib/myDay'
import type { Medication } from '../lib/meds'

export function MedicationsPage() {
  useDocumentTitle('Medications')
  const { user } = useAuth()
  const { medications, summary, removeMedication } = useMeds()
  const { announce } = useAnnouncer()

  const [addOpen, setAddOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<Medication | null>(null)

  const subject = user?.caringFor?.trim().split(' ')[0]
  const heading = subject ? `${subject}’s Medications` : 'Medications'

  const stats = [
    { id: 'taken', label: 'Doses taken today', value: `${summary.taken}`, tone: 'success' as const },
    { id: 'remaining', label: 'Doses remaining', value: `${summary.remaining}`, tone: 'accent' as const },
    { id: 'count', label: 'Medications', value: `${medications.length}`, tone: 'accent' as const },
  ]

  const confirmRemove = () => {
    if (!pendingRemove) return
    removeMedication(pendingRemove.id)
    announce(`${pendingRemove.name} removed.`)
    setPendingRemove(null)
  }

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li aria-current="page">Medications</li>
        </ol>
      </nav>

      <div className="page-heading">
        <h1>{heading}</h1>
        <button type="button" className="button" onClick={() => setAddOpen(true)}>
          <span aria-hidden="true">＋</span>
          Add Medication
        </button>
      </div>

      <section aria-labelledby="meds-summary-heading">
        <h2 id="meds-summary-heading" className="visually-hidden">
          Today at a glance
        </h2>
        <ul className="stat-grid">
          {stats.map((stat) => (
            <li key={stat.id} className="stat">
              <p className="stat__label">{stat.label}</p>
              <p className={`stat__value stat__value--${stat.tone}`}>{stat.value}</p>
            </li>
          ))}
        </ul>
        <p className="meds-next" role="status">
          {summary.total === 0
            ? 'No medications scheduled.'
            : summary.next
              ? `Next dose: ${summary.next.name} at ${formatTime(summary.next.time)}.`
              : 'All doses for today are done. Nothing else is due.'}
        </p>
      </section>

      <section aria-labelledby="meds-list-heading">
        <h2 id="meds-list-heading" className="visually-hidden">
          Medication list
        </h2>

        {medications.length === 0 ? (
          <p className="day-list__empty">
            No medications yet. Use <strong>Add Medication</strong> to add the first one.
          </p>
        ) : (
          <ul className="med-grid">
            {medications.map((med) => (
              <li key={med.id}>
                <MedicationCard med={med} onRemove={setPendingRemove} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddMedicationDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog
        open={pendingRemove !== null}
        title="Remove this medication?"
        description={
          pendingRemove
            ? `“${pendingRemove.name} ${pendingRemove.dosage}” and its dose history will be removed.`
            : undefined
        }
        onClose={() => setPendingRemove(null)}
      >
        <div className="dialog__footer">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setPendingRemove(null)}
          >
            Keep it
          </button>
          <button type="button" className="button button--danger" onClick={confirmRemove}>
            Yes, remove
          </button>
        </div>
      </Dialog>
    </>
  )
}
