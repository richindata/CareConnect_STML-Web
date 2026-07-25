import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

/**
 * Wraps the native <dialog>, which gives us the accessibility behaviour we
 * would otherwise hand-roll: a real focus trap, an inert background, Escape to
 * close, and modal role semantics. Focus returns to the opener automatically.
 */
export function Dialog({ open, title, description, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = `dialog-title-${title.replace(/\W+/g, '-').toLowerCase()}`
  const descriptionId = description ? `${headingId}-description` : undefined

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    // Fires for Escape and for form[method=dialog] submits alike.
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  // Clicking the backdrop (the dialog element itself, outside its content) closes.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) onClose()
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onClick={handleClick}
    >
      <div className="dialog__inner">
        <div className="dialog__header">
          <div>
            <h2 id={headingId}>{title}</h2>
            {description ? (
              <p id={descriptionId} className="field__hint">
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className="dialog__close" onClick={onClose}>
            <span aria-hidden="true">✕</span>
            <span className="visually-hidden">Close {title}</span>
          </button>
        </div>

        {children}
      </div>
    </dialog>
  )
}
