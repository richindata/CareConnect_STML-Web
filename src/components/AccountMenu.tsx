import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { useDismiss } from '../hooks/useDismiss'
import { initialsOf } from '../lib/dashboardData'

function AccountMenuComponent() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const signOutRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  useDismiss(ref, open, () => closeMenu(true))

  useEffect(() => {
    if (!open) return
    signOutRef.current?.focus()
  }, [open])

  const handleSignOut = () => {
    closeMenu(false)
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account__trigger"
        ref={triggerRef}
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account__avatar" aria-hidden="true">
          {initialsOf(user?.fullName ?? '?')}
        </span>
        <span className="account__text">
          <span className="account__name">{user?.fullName ?? 'Account'}</span>
          <span className="account__role">Primary</span>
        </span>
      </button>

      {open ? (
        <div className="account__menu" id="account-menu">
          <p className="account__email">{user?.email}</p>
          <button
            type="button"
            className="button button--secondary"
            ref={signOutRef}
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Memoized because it takes no props and doesn't depend on route — AppLayout
 * re-renders on every navigation for focus management, and without this that
 * re-render would cascade here for no reason.
 */
export const AccountMenu = memo(AccountMenuComponent)
