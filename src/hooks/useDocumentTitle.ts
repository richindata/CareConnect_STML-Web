import { useEffect } from 'react'

const SUFFIX = 'CareConnect'

/**
 * Keeps the document title in step with the route. Screen readers read the
 * title after a navigation, so this is what tells the user where they landed.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title === SUFFIX ? title : `${title} — ${SUFFIX}`
  }, [title])
}
