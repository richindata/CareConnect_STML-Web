import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

/**
 * Sends signed-out visitors back to the sign-in page, remembering where they
 * were headed so they land there after signing in.
 *
 * This is a navigation guard, not a security boundary — there is no server, so
 * the data behind it is on the device either way.
 */
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
