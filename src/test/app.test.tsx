import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { renderApp } from './renderApp'

/** Registers an account through the real UI and returns to the sign-in page. */
async function registerAccount(
  user: UserEvent,
  {
    fullName = 'Sarah Jenkins',
    email = 'sarah@example.com',
    password = 'correct-horse',
    caringFor = 'Eleanor Jenkins',
  } = {},
) {
  await user.type(await screen.findByLabelText(/full name/i), fullName)
  await user.type(screen.getByLabelText(/email address/i), email)
  if (caringFor) await user.type(screen.getByLabelText(/who are you caring for/i), caringFor)
  await user.type(screen.getByLabelText(/^password/i), password)
  await user.type(screen.getByLabelText(/confirm password/i), password)
  await user.click(screen.getByRole('button', { name: /create account/i }))

  const code = (await screen.findByText(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)).textContent!
  await user.click(screen.getByRole('button', { name: /continue to sign in/i }))
  return code
}

async function signIn(user: UserEvent, email = 'sarah@example.com', password = 'correct-horse') {
  await user.type(await screen.findByLabelText(/email address/i), email)
  await user.type(screen.getByLabelText(/password/i), password)
  await user.click(screen.getByRole('button', { name: /^sign in$/i }))
}

describe('routing and guards', () => {
  it('shows the sign-in page at /', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1, name: 'CareConnect' })).toBeInTheDocument()
  })

  it('redirects a signed-out visitor away from the dashboard', async () => {
    const { router } = renderApp('/dashboard')
    expect(await screen.findByRole('heading', { level: 1, name: 'CareConnect' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('redirects an unknown URL to sign in', async () => {
    const { router } = renderApp('/nowhere')
    await screen.findByRole('heading', { level: 1, name: 'CareConnect' })
    expect(router.state.location.pathname).toBe('/')
  })
})

describe('create account', () => {
  it('creates an account, issues a recovery code, and returns to sign in', async () => {
    const { user, router } = renderApp('/create-account')

    const code = await registerAccount(user)

    expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
    expect(router.state.location.pathname).toBe('/')
    expect(await screen.findByText(/your account is ready/i)).toBeInTheDocument()
  })

  it('rejects a password shorter than eight characters', async () => {
    const { user } = renderApp('/create-account')

    await user.type(await screen.findByLabelText(/full name/i), 'Sarah Jenkins')
    await user.type(screen.getByLabelText(/email address/i), 'sarah@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'short')
    await user.type(screen.getByLabelText(/confirm password/i), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByLabelText(/^password/i)).toHaveAccessibleDescription(
      /at least 8 characters/i,
    )
  })

  it('rejects mismatched passwords', async () => {
    const { user } = renderApp('/create-account')

    await user.type(await screen.findByLabelText(/full name/i), 'Sarah Jenkins')
    await user.type(screen.getByLabelText(/email address/i), 'sarah@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'correct-horse')
    await user.type(screen.getByLabelText(/confirm password/i), 'different-horse')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByLabelText(/confirm password/i)).toHaveAccessibleDescription(
      /do not match/i,
    )
  })

  it('refuses a duplicate email', async () => {
    const first = renderApp('/create-account')
    await registerAccount(first.user)
    first.unmount()

    const { user } = renderApp('/create-account')
    await user.type(await screen.findByLabelText(/full name/i), 'Someone Else')
    await user.type(screen.getByLabelText(/email address/i), 'sarah@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'another-password')
    await user.type(screen.getByLabelText(/confirm password/i), 'another-password')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
  })
})

describe('authentication', () => {
  it('signs in with correct credentials and lands on the dashboard', async () => {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const { user, router } = renderApp('/')
    await signIn(user)

    expect(await screen.findByRole('heading', { level: 1, name: /sarah/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('rejects a wrong password without revealing which field was wrong', async () => {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const { user, router } = renderApp('/')
    await signIn(user, 'sarah@example.com', 'wrong-password')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/email and password do not match/i)
    expect(router.state.location.pathname).toBe('/')
  })

  it('rejects an email that was never registered', async () => {
    const { user } = renderApp('/')
    await signIn(user, 'nobody@example.com', 'correct-horse')

    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match an account/i)
  })

  it('keeps the session across a reload and clears it on sign out', async () => {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const first = renderApp('/')
    await signIn(first.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })
    first.unmount()

    // A fresh mount reads the persisted session, so the dashboard is reachable.
    const second = renderApp('/dashboard')
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    await second.user.click(screen.getByRole('button', { name: /sarah jenkins/i }))
    await second.user.click(screen.getByRole('button', { name: /sign out/i }))

    expect(await screen.findByRole('heading', { level: 1, name: 'CareConnect' })).toBeInTheDocument()
    expect(second.router.state.location.pathname).toBe('/')
  })
})

describe('forgot password', () => {
  it('resets the password with a valid recovery code and signs in with the new one', async () => {
    const setup = renderApp('/create-account')
    const code = await registerAccount(setup.user)
    setup.unmount()

    const reset = renderApp('/forgot-password')
    await reset.user.type(await screen.findByLabelText(/email address/i), 'sarah@example.com')
    await reset.user.type(screen.getByLabelText(/recovery code/i), code)
    await reset.user.type(screen.getByLabelText(/^new password/i), 'brand-new-pass')
    await reset.user.type(screen.getByLabelText(/confirm new password/i), 'brand-new-pass')
    await reset.user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByRole('heading', { name: /your new recovery code/i })).toBeInTheDocument()
    await reset.user.click(screen.getByRole('button', { name: /continue to sign in/i }))
    reset.unmount()

    const { user, router } = renderApp('/')
    await signIn(user, 'sarah@example.com', 'brand-new-pass')
    expect(await screen.findByRole('heading', { level: 1, name: /sarah/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('retires the old recovery code once it has been used', async () => {
    const setup = renderApp('/create-account')
    const code = await registerAccount(setup.user)
    setup.unmount()

    const first = renderApp('/forgot-password')
    await first.user.type(await screen.findByLabelText(/email address/i), 'sarah@example.com')
    await first.user.type(screen.getByLabelText(/recovery code/i), code)
    await first.user.type(screen.getByLabelText(/^new password/i), 'brand-new-pass')
    await first.user.type(screen.getByLabelText(/confirm new password/i), 'brand-new-pass')
    await first.user.click(screen.getByRole('button', { name: /change password/i }))
    await screen.findByRole('heading', { name: /your new recovery code/i })
    first.unmount()

    const { user } = renderApp('/forgot-password')
    await user.type(await screen.findByLabelText(/email address/i), 'sarah@example.com')
    await user.type(screen.getByLabelText(/recovery code/i), code)
    await user.type(screen.getByLabelText(/^new password/i), 'third-password')
    await user.type(screen.getByLabelText(/confirm new password/i), 'third-password')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText(/do not match an account/i)).toBeInTheDocument()
  })

  it('rejects a wrong recovery code', async () => {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const { user } = renderApp('/forgot-password')
    await user.type(await screen.findByLabelText(/email address/i), 'sarah@example.com')
    await user.type(screen.getByLabelText(/recovery code/i), 'ZZZZ-ZZZZ-ZZZZ')
    await user.type(screen.getByLabelText(/^new password/i), 'brand-new-pass')
    await user.type(screen.getByLabelText(/confirm new password/i), 'brand-new-pass')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(await screen.findByText(/do not match an account/i)).toBeInTheDocument()
  })
})

describe('dashboard', () => {
  async function openDashboard() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })
    return session
  }

  it('greets the signed-in user and names who they care for', async () => {
    await openDashboard()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /good (morning|afternoon|evening), sarah/i,
    )
    expect(screen.getByText(/managing care for eleanor jenkins/i)).toBeInTheDocument()
  })

  it('renders the schedule, care team, and activity panels', async () => {
    await openDashboard()

    expect(screen.getByRole('heading', { name: /today.s schedule/i })).toBeInTheDocument()
    expect(screen.getByText(/doctor appointment/i)).toBeInTheDocument()

    const team = screen.getByRole('heading', { name: /care team/i }).closest('section')!
    expect(within(team).getByText(/nurse jenny/i)).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: /recent activity/i })).toBeInTheDocument()
  })

  it('marks completed schedule items for screen readers, not just visually', async () => {
    await openDashboard()

    const done = screen.getByText(/morning meds routine/i).closest('.schedule__title')!
    expect(done).toHaveTextContent(/completed/i)
  })

  it('exposes a labelled primary nav with the dashboard marked current', async () => {
    await openDashboard()

    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(within(nav).getByRole('link', { current: 'page' })).toHaveAccessibleName(/dashboard/i)
  })

  it('navigates to a section placeholder without pretending it is built', async () => {
    const { user } = await openDashboard()

    await user.click(screen.getByRole('link', { name: /^meds$/i }))
    expect(await screen.findByRole('heading', { level: 1, name: /meds/i })).toBeInTheDocument()
    expect(screen.getByText(/has not been built yet/i)).toBeInTheDocument()
  })
})
