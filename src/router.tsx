import { createBrowserRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { RootLayout } from './components/RootLayout'
import { ErrorPage } from './pages/ErrorPage'
import { TodayPage } from './pages/TodayPage'
import { RemindersPage } from './pages/RemindersPage'
import { RoutinePage } from './pages/RoutinePage'
import { PeoplePage } from './pages/PeoplePage'
import { NotesPage } from './pages/NotesPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * A single root route renders the shell; every page is a child, so the header,
 * navigation, and <main> persist across navigations. The catch-all keeps
 * unknown URLs inside the app instead of showing a bare server 404 — the
 * service worker's navigateFallback serves index.html for any deep link.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'reminders', element: <RemindersPage /> },
      { path: 'routine', element: <RoutinePage /> },
      { path: 'people', element: <PeoplePage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
