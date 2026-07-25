import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '../router'
import { AnnouncerProvider } from '../context/AnnouncerProvider'
import { AuthProvider } from '../context/AuthProvider'
import { SupportProvider } from '../context/SupportProvider'

/** Boots the real app (real routes, real providers) at a given URL. */
export function renderApp(initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const user = userEvent.setup()

  const result = render(
    <AnnouncerProvider>
      <SupportProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </SupportProvider>
    </AnnouncerProvider>,
  )

  return { ...result, user, router }
}
