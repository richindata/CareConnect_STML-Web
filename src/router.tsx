import { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { CareTeamProvider } from './context/CareTeamProvider'
import { MyDayProvider } from './context/MyDayProvider'
import { MedsProvider } from './context/MedsProvider'
import { AssistantProvider } from './context/AssistantProvider'
import { SettingsProvider } from './context/SettingsProvider'
import { MailProvider } from './context/MailProvider'
import { RemindersProvider } from './context/RemindersProvider'
import { ErrorPage } from './pages/ErrorPage'
import { SignInPage } from './pages/SignInPage'
import { CreateAccountPage } from './pages/CreateAccountPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { MyDayPage } from './pages/MyDayPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SettingsPage } from './pages/SettingsPage'
import { AccountSection } from './pages/settings/AccountSection'
import { NotificationsSection } from './pages/settings/NotificationsSection'
import { PrivacySection } from './pages/settings/PrivacySection'
import { AccessibilitySection } from './pages/settings/AccessibilitySection'
import { CarePreferencesSection } from './pages/settings/CarePreferencesSection'
import { AboutSection } from './pages/settings/AboutSection'

const LazyCareTeamPage = lazy(() =>
  import('./pages/CareTeamPage').then((module) => ({ default: module.CareTeamPage })),
)
const LazyMedicationsPage = lazy(() =>
  import('./pages/MedicationsPage').then((module) => ({ default: module.MedicationsPage })),
)
const LazyRemindersPage = lazy(() =>
  import('./pages/RemindersPage').then((module) => ({ default: module.RemindersPage })),
)
const LazyMailPage = lazy(() =>
  import('./pages/MailPage').then((module) => ({ default: module.MailPage })),
)
const LazyMailIndex = lazy(() =>
  import('./pages/MailPage').then((module) => ({ default: module.MailIndex })),
)
const LazyConversationView = lazy(() =>
  import('./pages/MailPage').then((module) => ({ default: module.ConversationView })),
)
const LazyAskAiPage = lazy(() =>
  import('./pages/AskAiPage').then((module) => ({ default: module.AskAiPage })),
)

function withRouteSuspense(node: React.ReactNode) {
  return (
    <Suspense fallback={<p className="visually-hidden">Loading section...</p>}>
      {node}
    </Suspense>
  )
}

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
        // Feature state is shared across the signed-in shell so it persists
        // while navigating between pages.
        // AssistantProvider is innermost because it reads the meds, schedule,
        // and care-team contexts to answer questions from live data.
        element: (
          <SettingsProvider>
            <CareTeamProvider>
              <MyDayProvider>
                <MedsProvider>
                  <MailProvider>
                    <RemindersProvider>
                      <AssistantProvider>
                        <AppLayout />
                      </AssistantProvider>
                    </RemindersProvider>
                  </MailProvider>
                </MedsProvider>
              </MyDayProvider>
            </CareTeamProvider>
          </SettingsProvider>
        ),
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/care-team', element: withRouteSuspense(<LazyCareTeamPage />) },
          { path: '/my-day', element: <MyDayPage /> },
          { path: '/meds', element: withRouteSuspense(<LazyMedicationsPage />) },
          { path: '/reminders', element: withRouteSuspense(<LazyRemindersPage />) },
          {
            path: '/mail',
            element: withRouteSuspense(<LazyMailPage />),
            children: [
              { index: true, element: withRouteSuspense(<LazyMailIndex />) },
              {
                path: ':conversationId',
                element: withRouteSuspense(<LazyConversationView />),
              },
            ],
          },
          { path: '/ai', element: withRouteSuspense(<LazyAskAiPage />) },
          {
            path: '/settings',
            element: <SettingsPage />,
            children: [
              // Default to Notifications so the landing view matches the design.
              { index: true, element: <Navigate to="/settings/notifications" replace /> },
              { path: 'account', element: <AccountSection /> },
              { path: 'notifications', element: <NotificationsSection /> },
              { path: 'privacy', element: <PrivacySection /> },
              { path: 'accessibility', element: <AccessibilitySection /> },
              { path: 'care-preferences', element: <CarePreferencesSection /> },
              { path: 'about', element: <AboutSection /> },
            ],
          },
          // Unknown authenticated URLs render the 404 inside the shell, so the
          // navigation stays available. RequireAuth still redirects signed-out
          // visitors to sign-in before this is reached.
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
