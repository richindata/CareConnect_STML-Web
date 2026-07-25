import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createId, readStored, writeStored } from '../lib/storage'
import {
  seedMedications,
  summariseDoses,
  toggleDoseLog,
  type DoseSummary,
  type Medication,
} from '../lib/meds'

const STORAGE_KEY = 'careconnect.meds.v1'

interface AddMedicationInput {
  name: string
  dosage: string
  times: string[]
  instructions?: string
}

interface MedsValue {
  medications: Medication[]
  summary: DoseSummary
  toggleDose: (medId: string, time: string) => void
  addMedication: (input: AddMedicationInput) => void
  removeMedication: (id: string) => void
}

const MedsContext = createContext<MedsValue | null>(null)

export function MedsProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(
    () => readStored<Medication[] | null>(STORAGE_KEY, null) ?? seedMedications(),
  )

  useEffect(() => {
    writeStored(STORAGE_KEY, medications)
  }, [medications])

  const value = useMemo<MedsValue>(
    () => ({
      medications,
      summary: summariseDoses(medications),

      toggleDose: (medId, time) =>
        setMedications((current) =>
          current.map((med) =>
            med.id === medId ? { ...med, takenLog: toggleDoseLog(med, time) } : med,
          ),
        ),

      addMedication: ({ name, dosage, times, instructions }) =>
        setMedications((current) => [
          ...current,
          {
            id: createId('med'),
            name,
            dosage,
            instructions,
            times: [...times].sort(),
            takenLog: [],
          },
        ]),

      removeMedication: (id) =>
        setMedications((current) => current.filter((med) => med.id !== id)),
    }),
    [medications],
  )

  return <MedsContext.Provider value={value}>{children}</MedsContext.Provider>
}

export function useMeds(): MedsValue {
  const context = useContext(MedsContext)
  if (!context) throw new Error('useMeds must be used inside <MedsProvider>')
  return context
}
