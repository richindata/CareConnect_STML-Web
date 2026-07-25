import { useState } from 'react'
import { Dialog } from './Dialog'
import { useMeds } from '../context/MedsProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { FREQUENCIES, timesForFrequency, type FrequencyId } from '../lib/meds'

interface AddMedicationDialogProps {
  open: boolean
  onClose: () => void
}

interface FieldErrors {
  name?: string
  dosage?: string
}

export function AddMedicationDialog({ open, onClose }: AddMedicationDialogProps) {
  const { addMedication } = useMeds()
  const { announce } = useAnnouncer()

  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState<FrequencyId>(FREQUENCIES[0].id)
  const [instructions, setInstructions] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  const reset = () => {
    setName('')
    setDosage('')
    setFrequency(FREQUENCIES[0].id)
    setInstructions('')
    setErrors({})
  }

  const close = () => {
    reset()
    onClose()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Enter the medication name.'
    if (!dosage.trim()) next.dosage = 'Enter the dose, for example “500 mg”.'

    setErrors(next)
    if (next.name || next.dosage) {
      document.getElementById(next.name ? 'med-name' : 'med-dosage')?.focus()
      announce('There is a problem with the form.')
      return
    }

    addMedication({
      name: name.trim(),
      dosage: dosage.trim(),
      times: timesForFrequency(frequency),
      instructions: instructions.trim() || undefined,
    })
    announce(`Medication added: ${name.trim()}.`)
    close()
  }

  return (
    <Dialog
      open={open}
      title="Add Medication"
      description="It will appear in the medication list with today’s doses ready to check off."
      onClose={close}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="med-name">
            Medication name <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="med-name"
            type="text"
            autoComplete="off"
            placeholder="Metformin"
            required
            value={name}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'med-name-error' : undefined}
            onChange={(event) => {
              setName(event.target.value)
              if (errors.name) setErrors((current) => ({ ...current, name: undefined }))
            }}
          />
          {errors.name ? (
            <p id="med-name-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="med-dosage">
            Dose <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="med-dosage"
            type="text"
            autoComplete="off"
            placeholder="500 mg"
            required
            value={dosage}
            aria-invalid={errors.dosage ? 'true' : undefined}
            aria-describedby={errors.dosage ? 'med-dosage-error' : undefined}
            onChange={(event) => {
              setDosage(event.target.value)
              if (errors.dosage) setErrors((current) => ({ ...current, dosage: undefined }))
            }}
          />
          {errors.dosage ? (
            <p id="med-dosage-error" className="field__error">
              <span aria-hidden="true">⚠</span>
              {errors.dosage}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="med-frequency">How often?</label>
          <select
            id="med-frequency"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value as FrequencyId)}
          >
            {FREQUENCIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="med-instructions">Instructions (optional)</label>
          <input
            id="med-instructions"
            type="text"
            autoComplete="off"
            placeholder="Take with food"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
          />
        </div>

        <div className="dialog__footer">
          <button type="button" className="button button--secondary" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="button">
            Add Medication
          </button>
        </div>
      </form>
    </Dialog>
  )
}
