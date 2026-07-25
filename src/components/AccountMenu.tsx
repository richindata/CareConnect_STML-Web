import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { useDismiss } from '../hooks/useDismiss'
import { initialsOf } from '../lib/dashboardData'

/** Avatar button that discloses the signed-in user's email and a sign-out action. */
export function AccountMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useDismiss(ref, open, () => setOpen(false))

  const handleSignOut = () => {
    setOpen(false)
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="account" ref={ref}>
      <button
        type="button"
        className="account__trigger"
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
          <button type="button" className="button button--secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
