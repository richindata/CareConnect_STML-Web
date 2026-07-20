import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { ErrorPage } from './pages/ErrorPage'
import { SignInPage } from './pages/SignInPage'
import { CreateAccountPage } from './pages/CreateAccountPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { SectionPlaceholderPage } from './pages/SectionPlaceholderPage'

/**
 * Signed-out screens render their own centred card. Everything behind
 * RequireAuth shares the masthead shell, and redirects to sign-in when there
 * is no session.
 */
export const routes: RouteObject[] = [
  { path: '/', element: <SignInPage />, errorElement: <ErrorPage /> },
  { path: '/create-account', element: <CreateAccountPage />, errorElement: <ErrorPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage />, errorElement: <ErrorPage /> },

  {
    element: <RequireAuth />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/my-day', element: <SectionPlaceholderPage /> },
          { path: '/meds', element: <SectionPlaceholderPage /> },
          { path: '/mail', element: <SectionPlaceholderPage /> },
          { path: '/ai', element: <SectionPlaceholderPage /> },
          { path: '/settings', element: <SectionPlaceholderPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]

export const router = createBrowserRouter(routes)
