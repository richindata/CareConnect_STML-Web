import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '../router'
import { AnnouncerProvider } from '../context/AnnouncerProvider'
import { AppDataProvider } from '../context/AppDataProvider'
import { PreferencesProvider } from '../context/PreferencesProvider'

/** Boots the real app (real routes, real providers) at a given URL. */
export function renderApp(initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const user = userEvent.setup()

  const result = render(
    <PreferencesProvider>
      <AnnouncerProvider>
        <AppDataProvider>
          <RouterProvider router={router} />
        </AppDataProvider>
      </AnnouncerProvider>
    </PreferencesProvider>,
  )

  return { ...result, user, router }
}
