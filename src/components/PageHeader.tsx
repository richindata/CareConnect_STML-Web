import type { ReactNode } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

interface PageHeaderProps {
  title: string
  /** Defaults to the visible title; pass this when the tab needs shorter text. */
  documentTitle?: string
  intro?: ReactNode
  actions?: ReactNode
}

/** The single <h1> for a page, plus its document title. */
export function PageHeader({ title, documentTitle, intro, actions }: PageHeaderProps) {
  useDocumentTitle(documentTitle ?? title)

  return (
    <div className="page-header">
      <div className="section__header">
        <h1>{title}</h1>
        {actions ? <div className="button-row">{actions}</div> : null}
      </div>
      {intro ? <p>{intro}</p> : null}
    </div>
  )
}
