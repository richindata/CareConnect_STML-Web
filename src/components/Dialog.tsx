import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/**
 * Wraps the native <dialog> element, which gives us the accessibility
 * behaviour we would otherwise hand-roll: a real focus trap, inert background
 * content, Escape-to-close, and role="dialog" with modal semantics.
 * Focus returns to the trigger automatically when the dialog closes.
 */
export function Dialog({ open, title, description, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = `dialog-title-${title.replace(/\W+/g, '-').toLowerCase()}`
  const descriptionId = description ? `${headingId}-description` : undefined

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    // Fires for Escape and for form[method=dialog] submits alike.
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  // Clicking the backdrop closes, matching the expectation set by the Cancel
  // button. The check compares against the dialog itself because the backdrop
  // is not a separate element.
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

        {footer ? <div className="dialog__footer">{footer}</div> : null}
      </div>
    </dialog>
  )
}
