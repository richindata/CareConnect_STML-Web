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
import { CareTeamPage } from './pages/CareTeamPage'
import { MyDayPage } from './pages/MyDayPage'
import { MedicationsPage } from './pages/MedicationsPage'
import { AskAiPage } from './pages/AskAiPage'
import { RemindersPage } from './pages/RemindersPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { MailPage, MailIndex, ConversationView } from './pages/MailPage'
import { SettingsPage } from './pages/SettingsPage'
import { AccountSection } from './pages/settings/AccountSection'
import { NotificationsSection } from './pages/settings/NotificationsSection'
import { PrivacySection } from './pages/settings/PrivacySection'
import { AccessibilitySection } from './pages/settings/AccessibilitySection'
import { CarePreferencesSection } from './pages/settings/CarePreferencesSection'
import { AboutSection } from './pages/settings/AboutSection'

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
          { path: '/care-team', element: <CareTeamPage /> },
          { path: '/my-day', element: <MyDayPage /> },
          { path: '/meds', element: <MedicationsPage /> },
          { path: '/reminders', element: <RemindersPage /> },
          {
            path: '/mail',
            element: <MailPage />,
            children: [
              { index: true, element: <MailIndex /> },
              { path: ':conversationId', element: <ConversationView /> },
            ],
          },
          { path: '/ai', element: <AskAiPage /> },
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
