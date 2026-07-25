import { useEffect, useState } from 'react'

/**
 * Edit-then-save form state. Holds a local draft copy of a value, tracks
 * whether it differs from the committed original, and re-syncs if the original
 * changes underneath (e.g. loaded from storage after mount).
 */
export function useDraft<T>(original: T) {
  const [draft, setDraft] = useState<T>(original)

  useEffect(() => {
    setDraft(original)
  }, [original])

  const dirty = JSON.stringify(draft) !== JSON.stringify(original)

  return { draft, setDraft, dirty, reset: () => setDraft(original) }
}
