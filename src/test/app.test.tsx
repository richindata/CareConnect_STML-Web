import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { renderApp } from './renderApp'
import { setViewportWidth } from './setup'

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

  it('navigates to another section from the nav', async () => {
    const { user } = await openDashboard()

    await user.click(screen.getByRole('link', { name: /^mail$/i }))
    expect(await screen.findByRole('heading', { level: 1, name: /inbox/i })).toBeInTheDocument()
  })
})

describe('responsive navigation', () => {
  async function openDashboard() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })
    return session
  }

  it('shows the links inline at desktop width with no menu toggle', async () => {
    setViewportWidth(1440)
    await openDashboard()

    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(within(nav).getByRole('link', { name: /dashboard/i })).toBeVisible()
    expect(within(nav).queryByRole('button', { name: /menu/i })).not.toBeInTheDocument()
  })

  it('collapses to a hamburger at mobile width and toggles the links', async () => {
    setViewportWidth(375)
    const { user } = await openDashboard()

    const nav = screen.getByRole('navigation', { name: /primary/i })
    const toggle = within(nav).getByRole('button', { name: /menu/i })

    // Closed by default: links are not in the DOM.
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(nav).queryByRole('link', { name: /^mail$/i })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(within(nav).getByRole('link', { name: /^mail$/i })).toBeInTheDocument()

    // Escape closes it again.
    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu after following a link', async () => {
    setViewportWidth(375)
    const { user } = await openDashboard()

    const nav = screen.getByRole('navigation', { name: /primary/i })
    await user.click(within(nav).getByRole('button', { name: /menu/i }))
    await user.click(within(nav).getByRole('link', { name: /^mail$/i }))

    expect(await screen.findByRole('heading', { level: 1, name: /inbox/i })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: /menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})

describe('care team', () => {
  /** Signs in and reaches the care team via the dashboard's Manage link. */
  async function openCareTeam() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    await session.user.click(screen.getByRole('link', { name: /manage/i }))
    await screen.findByRole('heading', { level: 1, name: /care team/i })
    return session
  }

  it('opens from the dashboard Manage link at /care-team', async () => {
    const { router } = await openCareTeam()

    expect(router.state.location.pathname).toBe('/care-team')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/eleanor.s care team/i)
    const crumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(crumb).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('lists every seeded member with their role and contact links', async () => {
    await openCareTeam()

    const sarah = screen.getByRole('heading', { name: 'Sarah Chen' }).closest('article')!
    expect(within(sarah).getByText('Primary Caregiver')).toBeInTheDocument()
    expect(within(sarah).getByRole('link', { name: /\+1 \(555\) 432-8765/ })).toHaveAttribute(
      'href',
      'tel:+15554328765',
    )
    expect(
      within(sarah).getByRole('link', { name: /sarah\.chen@careconnect\.com/ }),
    ).toHaveAttribute('href', 'mailto:sarah.chen@careconnect.com')

    expect(screen.getByRole('heading', { name: 'Jenny Williams' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Michael Chen' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rosa Gutierrez' })).toBeInTheDocument()
  })

  it('shows the seeded pending invitation with resend and cancel actions', async () => {
    await openCareTeam()

    const invites = screen.getByRole('heading', { name: /pending invitations/i }).closest('section')!
    expect(within(invites).getByText(/dr\.robert\.martinez@clinic\.com/i, { selector: '.invite__email' })).toBeInTheDocument()
    expect(within(invites).getByText(/invited as geriatrician/i)).toBeInTheDocument()
    expect(within(invites).getByRole('button', { name: /resend invitation/i })).toBeInTheDocument()
    expect(within(invites).getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('validates the invite form and blocks a bad email', async () => {
    const { user } = await openCareTeam()

    await user.click(screen.getByRole('button', { name: /invite caregiver/i }))
    const dialog = await screen.findByRole('dialog')

    // Empty submit is rejected.
    await user.click(within(dialog).getByRole('button', { name: /send invitation/i }))
    expect(within(dialog).getByLabelText(/email address/i)).toHaveAccessibleDescription(
      /enter the caregiver.s email/i,
    )

    // A malformed address is rejected with a tied message.
    await user.type(within(dialog).getByLabelText(/email address/i), 'not-an-email')
    await user.click(within(dialog).getByRole('button', { name: /send invitation/i }))
    expect(within(dialog).getByLabelText(/email address/i)).toHaveAccessibleDescription(
      /does not look like an email/i,
    )
  })

  it('adds a new pending invitation through the form', async () => {
    const { user } = await openCareTeam()

    await user.click(screen.getByRole('button', { name: /invite caregiver/i }))
    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText(/email address/i), 'new.helper@example.com')
    await user.selectOptions(within(dialog).getByLabelText(/role/i), 'Physical Therapist')
    await user.click(within(dialog).getByRole('button', { name: /send invitation/i }))

    // Dialog closes and the invitation appears in the pending list.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const invites = screen.getByRole('heading', { name: /pending invitations/i }).closest('section')!
    expect(within(invites).getByText(/new\.helper@example\.com/i, { selector: '.invite__email' })).toBeInTheDocument()
    expect(within(invites).getByText(/invited as physical therapist/i)).toBeInTheDocument()
  })

  it('cancels a pending invitation', async () => {
    const { user } = await openCareTeam()

    const invites = screen.getByRole('heading', { name: /pending invitations/i }).closest('section')!
    await user.click(within(invites).getByRole('button', { name: /cancel/i }))

    expect(within(invites).queryByText(/dr\.robert\.martinez@clinic\.com/i, { selector: '.invite__email' })).not.toBeInTheDocument()
    expect(within(invites).getByText(/everyone has responded/i)).toBeInTheDocument()
  })

  it('persists a new invitation across a remount', async () => {
    const first = await openCareTeam()

    await first.user.click(screen.getByRole('button', { name: /invite caregiver/i }))
    const dialog = await screen.findByRole('dialog')
    await first.user.type(within(dialog).getByLabelText(/email address/i), 'persist@example.com')
    await first.user.click(within(dialog).getByRole('button', { name: /send invitation/i }))
    await screen.findByText(/persist@example\.com/i, { selector: '.invite__email' })
    first.unmount()

    renderApp('/care-team')
    expect(await screen.findByText(/persist@example\.com/i, { selector: '.invite__email' })).toBeInTheDocument()
  })
})

describe('my day', () => {
  /** Signs in and reaches My Day via the dashboard's "Go to Daily View" link. */
  async function openMyDay() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    await session.user.click(screen.getByRole('link', { name: /go to daily view/i }))
    await screen.findByRole('heading', { level: 1, name: /schedule/i })
    return session
  }

  it('opens from the dashboard "Go to Daily View" link at /my-day', async () => {
    const { router } = await openMyDay()

    expect(router.state.location.pathname).toBe('/my-day')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/eleanor.s schedule/i)
    const crumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(crumb).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('lists the day’s tasks with completed and pending states', async () => {
    await openMyDay()

    const wake = screen.getByRole('checkbox', { name: /wake-up routine/i })
    expect(wake).toBeChecked()

    const doctor = screen.getByRole('checkbox', { name: /doctor visit/i })
    expect(doctor).not.toBeChecked()

    const doctorRow = doctor.closest('.task-row') as HTMLElement
    expect(within(doctorRow).getByText('Pending')).toBeInTheDocument()
    expect(within(doctorRow).getByText(/nurse jenny/i)).toBeInTheDocument()
  })

  it('toggles a task with the keyboard and updates its status', async () => {
    const { user } = await openMyDay()

    const doctor = screen.getByRole('checkbox', { name: /doctor visit/i })
    doctor.focus()
    await user.keyboard(' ')

    expect(doctor).toBeChecked()
    const row = doctor.closest('.task-row') as HTMLElement
    expect(within(row).getByText('Completed')).toBeInTheDocument()
  })

  it('shows the empty state when a day without tasks is selected', async () => {
    const { user } = await openMyDay()

    const week = screen.getByRole('group', { name: /choose a day/i })
    const otherDay = within(week)
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-pressed') === 'false')!
    await user.click(otherDay)

    expect(screen.getByText(/this day is clear/i)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /doctor visit/i })).not.toBeInTheDocument()
  })

  it('validates the add-task form', async () => {
    const { user } = await openMyDay()

    await user.click(screen.getByRole('button', { name: /add task/i }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: /^add task$/i }))
    expect(within(dialog).getByLabelText(/task/i, { selector: '#task-title' })).toHaveAccessibleDescription(
      /give the task a name/i,
    )
  })

  it('adds a task to the selected day', async () => {
    const { user } = await openMyDay()

    await user.click(screen.getByRole('button', { name: /add task/i }))
    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText(/task/i, { selector: '#task-title' }), 'Afternoon nap')
    await user.click(within(dialog).getByRole('button', { name: /^add task$/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /afternoon nap/i })).toBeInTheDocument()
  })

  it('persists a completed task across a remount', async () => {
    const first = await openMyDay()

    const doctor = screen.getByRole('checkbox', { name: /doctor visit/i })
    await first.user.click(doctor)
    expect(doctor).toBeChecked()
    first.unmount()

    renderApp('/my-day')
    expect(await screen.findByRole('checkbox', { name: /doctor visit/i })).toBeChecked()
  })
})

describe('medications', () => {
  /** Signs in and reaches Medications via the primary nav link. */
  async function openMeds() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    const nav = screen.getByRole('navigation', { name: /primary/i })
    await session.user.click(within(nav).getByRole('link', { name: /medications/i }))
    await screen.findByRole('heading', { level: 1, name: /medications/i })
    return session
  }

  it('opens from the Medications nav link at /meds', async () => {
    const { router } = await openMeds()

    expect(router.state.location.pathname).toBe('/meds')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/eleanor.s medications/i)
    const crumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(crumb).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('lists seeded medications with dosage and the next due dose', async () => {
    await openMeds()

    const metformin = screen.getByRole('article', { name: 'Metformin' })
    expect(within(metformin).getByText('500 mg')).toBeInTheDocument()
    expect(within(metformin).getByText('1/2 taken')).toBeInTheDocument()

    expect(screen.getByRole('article', { name: 'Lisinopril' })).toBeInTheDocument()
    expect(screen.getByText(/next dose: lisinopril/i)).toBeInTheDocument()
  })

  it('marks a dose as taken with the keyboard and updates the summary', async () => {
    const { user } = await openMeds()

    const lisinopril = screen.getByRole('article', { name: 'Lisinopril' })
    const dose = within(lisinopril).getByRole('checkbox')
    expect(dose).not.toBeChecked()

    dose.focus()
    await user.keyboard(' ')
    expect(dose).toBeChecked()
    expect(within(lisinopril).getByText('1/1 taken')).toBeInTheDocument()

    // The next-dose hint moves on from Lisinopril.
    expect(screen.queryByText(/next dose: lisinopril/i)).not.toBeInTheDocument()
  })

  it('validates the add-medication form', async () => {
    const { user } = await openMeds()

    await user.click(screen.getByRole('button', { name: /add medication/i }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: /^add medication$/i }))
    expect(within(dialog).getByLabelText(/medication name/i)).toHaveAccessibleDescription(
      /enter the medication name/i,
    )

    // Filling the name surfaces the dose requirement next.
    await user.type(within(dialog).getByLabelText(/medication name/i), 'Ibuprofen')
    await user.click(within(dialog).getByRole('button', { name: /^add medication$/i }))
    expect(within(dialog).getByLabelText(/^dose/i)).toHaveAccessibleDescription(/enter the dose/i)
  })

  it('adds a medication through the form', async () => {
    const { user } = await openMeds()

    await user.click(screen.getByRole('button', { name: /add medication/i }))
    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText(/medication name/i), 'Ibuprofen')
    await user.type(within(dialog).getByLabelText(/^dose/i), '200 mg')
    await user.selectOptions(within(dialog).getByLabelText(/how often/i), 'twice')
    await user.click(within(dialog).getByRole('button', { name: /^add medication$/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const added = screen.getByRole('article', { name: 'Ibuprofen' })
    expect(within(added).getByText('200 mg')).toBeInTheDocument()
    // "Twice daily" produced two dose checkboxes.
    expect(within(added).getAllByRole('checkbox')).toHaveLength(2)
  })

  it('removes a medication after confirmation', async () => {
    const { user } = await openMeds()

    const metformin = screen.getByRole('article', { name: 'Metformin' })
    await user.click(within(metformin).getByRole('button', { name: /remove metformin/i }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /yes, remove/i }))

    expect(screen.queryByRole('article', { name: 'Metformin' })).not.toBeInTheDocument()
  })

  it('persists a taken dose across a remount', async () => {
    const first = await openMeds()

    const lisinopril = screen.getByRole('article', { name: 'Lisinopril' })
    await first.user.click(within(lisinopril).getByRole('checkbox'))
    first.unmount()

    renderApp('/meds')
    const reloaded = await screen.findByRole('article', { name: 'Lisinopril' })
    expect(within(reloaded).getByRole('checkbox')).toBeChecked()
  })
})

describe('ask ai', () => {
  /** Signs in and reaches Ask AI via the primary nav link. */
  async function openAskAi() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    const nav = screen.getByRole('navigation', { name: /primary/i })
    await session.user.click(within(nav).getByRole('link', { name: /ask ai/i }))
    await screen.findByRole('heading', { level: 1, name: /ask ai/i })
    return session
  }

  it('opens from the Ask AI nav link at /ai with an intro message', async () => {
    const { router } = await openAskAi()

    expect(router.state.location.pathname).toBe('/ai')
    const crumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(crumb).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByText(/i.m the careconnect assistant/i)).toBeInTheDocument()
  })

  it('answers a medications question from live data', async () => {
    const { user } = await openAskAi()

    await user.type(
      screen.getByRole('textbox', { name: /ask about care plans/i }),
      'What medications are due today?',
    )
    await user.click(screen.getByRole('button', { name: /send question/i }))

    expect(screen.getByText(/here are the medications scheduled/i)).toBeInTheDocument()
    // Metformin appears once per dose time, so there is at least one entry.
    expect(screen.getAllByText(/metformin/i).length).toBeGreaterThan(0)
  })

  it('answers a suggested care-team question', async () => {
    const { user } = await openAskAi()

    await user.click(screen.getByRole('button', { name: /show care team schedule/i }))
    expect(screen.getByText(/jenny williams/i)).toBeInTheDocument()
  })

  it('renders the sleep chart with an accessible data table for the weekly summary', async () => {
    const { user } = await openAskAi()

    await user.click(screen.getByRole('button', { name: /weekly health summary/i }))

    // The chart caption and the visually-hidden data table both appear.
    expect(screen.getByText(/sleep duration, last 7 days/i)).toBeInTheDocument()
    const table = screen.getByRole('table', { name: /sleep duration in hours/i })
    expect(within(table).getByRole('row', { name: /sat.*5\.5.*restless/i })).toBeInTheDocument()
  })

  it('is honest that it cannot check real drug interactions', async () => {
    const { user } = await openAskAi()

    await user.click(screen.getByRole('button', { name: /medication interactions/i }))
    expect(screen.getByText(/can.t check real drug interactions/i)).toBeInTheDocument()
    expect(screen.getByText(/pharmacist/i)).toBeInTheDocument()
  })

  it('validates that the question is not empty', async () => {
    const { user } = await openAskAi()

    await user.click(screen.getByRole('button', { name: /send question/i }))

    const input = screen.getByRole('textbox', { name: /ask about care plans/i })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/type a question first/i)
  })

  it('persists the conversation across a remount', async () => {
    const first = await openAskAi()

    await first.user.type(
      screen.getByRole('textbox', { name: /ask about care plans/i }),
      'What are the upcoming appointments?',
    )
    await first.user.click(screen.getByRole('button', { name: /send question/i }))
    expect(screen.getByText(/what are the upcoming appointments\?/i)).toBeInTheDocument()
    first.unmount()

    renderApp('/ai')
    expect(
      await screen.findByText(/what are the upcoming appointments\?/i),
    ).toBeInTheDocument()
  })
})

describe('settings', () => {
  /** Signs in and reaches Settings via the primary nav link. */
  async function openSettings() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    const nav = screen.getByRole('navigation', { name: /primary/i })
    await session.user.click(within(nav).getByRole('link', { name: /settings/i }))
    await screen.findByRole('heading', { level: 1, name: /^settings$/i })
    return session
  }

  function sectionNav() {
    return screen.getByRole('navigation', { name: /settings sections/i })
  }

  it('opens from the nav and defaults to Notifications', async () => {
    const { router } = await openSettings()

    expect(router.state.location.pathname).toBe('/settings/notifications')
    expect(screen.getByRole('heading', { name: /notification preferences/i })).toBeInTheDocument()
    expect(within(sectionNav()).getByRole('link', { current: 'page' })).toHaveAccessibleName(
      /notifications/i,
    )
  })

  it('switches sections through the settings nav (nested routes)', async () => {
    const { user, router } = await openSettings()

    await user.click(within(sectionNav()).getByRole('link', { name: /accessibility/i }))
    expect(router.state.location.pathname).toBe('/settings/accessibility')
    expect(screen.getByRole('heading', { name: /^accessibility$/i })).toBeInTheDocument()
  })

  it('saves a notification toggle and persists it across a remount', async () => {
    const first = await openSettings()

    const appointment = screen.getByRole('switch', { name: /appointment reminders/i })
    expect(appointment).not.toBeChecked()
    await first.user.click(appointment)
    await first.user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(appointment).toBeChecked()
    first.unmount()

    // A fresh mount reads the saved preference.
    renderApp('/settings/notifications')
    expect(await screen.findByRole('switch', { name: /appointment reminders/i })).toBeChecked()
  })

  it('applies an accessibility toggle to the document immediately', async () => {
    const { user } = await openSettings()

    await user.click(within(sectionNav()).getByRole('link', { name: /accessibility/i }))
    await user.click(await screen.findByRole('switch', { name: /larger text/i }))

    expect(document.documentElement).toHaveAttribute('data-text-size', 'large')
  })

  it('validates the account form', async () => {
    const { user } = await openSettings()

    await user.click(within(sectionNav()).getByRole('link', { name: /account/i }))
    const name = await screen.findByLabelText(/your name/i)
    await user.clear(name)
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription(/enter your name/i)
  })

  it('rejects an invalid emergency phone number in care preferences', async () => {
    const { user } = await openSettings()

    await user.click(within(sectionNav()).getByRole('link', { name: /care preferences/i }))
    const phone = await screen.findByLabelText(/emergency contact number/i)
    await user.clear(phone)
    await user.type(phone, '123')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAccessibleDescription(/valid phone number/i)
  })
})

describe('mail', () => {
  /** Signs in and reaches Mail via the primary nav link. */
  async function openMail() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    const nav = screen.getByRole('navigation', { name: /primary/i })
    // On mobile the links sit behind the hamburger; open it first.
    const menuToggle = within(nav).queryByRole('button', { name: /menu/i })
    if (menuToggle) await session.user.click(menuToggle)
    await session.user.click(within(nav).getByRole('link', { name: /^mail$/i }))
    await screen.findByRole('heading', { level: 1, name: /inbox/i })
    return session
  }

  it('opens from the nav and shows the inbox with the first thread on desktop', async () => {
    const { router } = await openMail()

    // Wide layout auto-opens the first conversation.
    expect(router.state.location.pathname).toBe('/mail/c-martinez')
    const crumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(crumb).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Dr. Martinez' })).toBeInTheDocument()
    // Scoped to the badge: the role text also appears in the compose recipient list.
    expect(screen.getByText(/primary care physician/i, { selector: '.badge' })).toBeInTheDocument()
    expect(screen.getByText(/reduce metformin from 500mg/i)).toBeInTheDocument()
  })

  it('lists every conversation and opens the one you pick', async () => {
    const { user } = await openMail()

    expect(screen.getByRole('link', { name: /nurse jenny/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pharmacy/i })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /brother michael/i }))
    expect(await screen.findByRole('heading', { name: 'Brother Michael' })).toBeInTheDocument()
    expect(screen.getByText(/take the saturday morning shift/i)).toBeInTheDocument()
  })

  it('sends a reply, and validates an empty one', async () => {
    const { user } = await openMail()

    const composer = screen.getByRole('textbox', { name: /type your message/i })

    // Empty submit is rejected.
    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(composer).toHaveAttribute('aria-invalid', 'true')
    expect(composer).toHaveAccessibleDescription(/type a message first/i)

    await user.type(composer, 'Thank you, I will keep an eye on her energy levels.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(screen.getByText(/keep an eye on her energy levels/i, { selector: '.bubble__text' })).toBeInTheDocument()
    expect(composer).toHaveValue('')
  })

  it('starts a new message from the compose dialog', async () => {
    const { user, router } = await openMail()

    await user.click(screen.getByRole('button', { name: /new message/i }))
    const dialog = await screen.findByRole('dialog')

    await user.selectOptions(within(dialog).getByLabelText(/^to/i), 'c-pharmacy')
    await user.type(within(dialog).getByLabelText(/^message/i), 'Is the refill still available?')
    await user.click(within(dialog).getByRole('button', { name: /^send$/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mail/c-pharmacy')
    expect(screen.getByText(/is the refill still available\?/i, { selector: '.bubble__text' })).toBeInTheDocument()
  })

  it('collapses to a single pane on mobile and marks a conversation read', async () => {
    setViewportWidth(375)
    const { user } = await openMail()

    // At mobile width /mail shows only the list — no reply composer yet.
    expect(screen.getByRole('heading', { name: /recent conversations/i })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /type your message/i })).not.toBeInTheDocument()

    const martinez = screen.getByRole('link', { name: /dr\. martinez/i })
    expect(within(martinez).getByText('Unread')).toBeInTheDocument()

    await user.click(martinez)
    // Now the thread shows, with a back link and the composer.
    expect(await screen.findByRole('heading', { name: 'Dr. Martinez' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /type your message/i })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /inbox/i }))
    // Back on the list, the conversation is no longer unread.
    const reloaded = screen.getByRole('link', { name: /dr\. martinez/i })
    expect(within(reloaded).queryByText('Unread')).not.toBeInTheDocument()
  })

  it('persists a sent message across a remount', async () => {
    const first = await openMail()

    const composer = screen.getByRole('textbox', { name: /type your message/i })
    await first.user.type(composer, 'Noted, thank you Doctor.')
    await first.user.click(screen.getByRole('button', { name: /send message/i }))
    expect(screen.getByText(/noted, thank you doctor/i, { selector: '.bubble__text' })).toBeInTheDocument()
    first.unmount()

    renderApp('/mail/c-martinez')
    expect(await screen.findByText(/noted, thank you doctor/i, { selector: '.bubble__text' })).toBeInTheDocument()
  })
})

describe('reminders', () => {
  /** Signs in and reaches Reminders via the primary nav link. */
  async function openReminders() {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })

    const nav = screen.getByRole('navigation', { name: /primary/i })
    await session.user.click(within(nav).getByRole('link', { name: /reminders/i }))
    await screen.findByRole('heading', { level: 1, name: /reminders/i })
    return session
  }

  function status() {
    return screen.getByRole('region', { name: /how today is going/i })
  }

  it('opens from the new nav item at /reminders with a progress summary', async () => {
    const { router } = await openReminders()

    expect(router.state.location.pathname).toBe('/reminders')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/eleanor.s reminders/i)
    const crumb = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(within(crumb).getByRole('link', { name: /dashboard/i })).toBeInTheDocument()

    expect(within(status()).getByText(/3 of 8 done/i)).toBeInTheDocument()
    expect(within(status()).getByText('Eat lunch')).toBeInTheDocument()
  })

  it('shows completed and pending reminders', async () => {
    await openReminders()

    expect(screen.getByRole('checkbox', { name: /take morning medication/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /eat lunch/i })).not.toBeChecked()
  })

  it('ticks off a reminder with the keyboard and advances the next-up hint', async () => {
    const { user } = await openReminders()

    const lunch = screen.getByRole('checkbox', { name: /eat lunch/i })
    lunch.focus()
    await user.keyboard(' ')

    expect(lunch).toBeChecked()
    expect(within(status()).getByText(/4 of 8 done/i)).toBeInTheDocument()
    expect(within(status()).getByText('Afternoon walk')).toBeInTheDocument()
  })

  it('validates the add-reminder form', async () => {
    const { user } = await openReminders()

    await user.click(screen.getByRole('button', { name: /add reminder/i }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: /^add reminder$/i }))
    expect(within(dialog).getByLabelText(/what is the reminder/i)).toHaveAccessibleDescription(
      /give the reminder a name/i,
    )
  })

  it('adds a reminder to the list', async () => {
    const { user } = await openReminders()

    await user.click(screen.getByRole('button', { name: /add reminder/i }))
    const dialog = await screen.findByRole('dialog')

    await user.type(within(dialog).getByLabelText(/what is the reminder/i), 'Call the doctor')
    await user.click(within(dialog).getByRole('button', { name: /^add reminder$/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /call the doctor/i })).toBeInTheDocument()
  })

  it('removes a reminder after confirmation', async () => {
    const { user } = await openReminders()

    await user.click(screen.getByRole('button', { name: /remove reminder: get ready for bed/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /yes, remove/i }))

    expect(screen.queryByRole('checkbox', { name: /get ready for bed/i })).not.toBeInTheDocument()
  })

  it('persists a completed reminder across a remount', async () => {
    const first = await openReminders()

    const walk = screen.getByRole('checkbox', { name: /afternoon walk/i })
    await first.user.click(walk)
    expect(walk).toBeChecked()
    first.unmount()

    renderApp('/reminders')
    expect(await screen.findByRole('checkbox', { name: /afternoon walk/i })).toBeChecked()
  })
})

describe('not found / error', () => {
  /** Establishes a session, then renders the app at `path` with it active. */
  async function signedInAt(path: string) {
    const setup = renderApp('/create-account')
    await registerAccount(setup.user)
    setup.unmount()

    const session = renderApp('/')
    await signIn(session.user)
    await screen.findByRole('heading', { level: 1, name: /sarah/i })
    session.unmount()

    return renderApp(path)
  }

  it('shows the 404 inside the shell (with navigation) for an unknown authed URL', async () => {
    const { router } = await signedInAt('/this-page-does-not-exist')

    expect(await screen.findByRole('heading', { level: 1, name: /404/i })).toBeInTheDocument()
    // The masthead navigation is still present, so a lost user can get back.
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toBeInTheDocument()
    // Route did not change out from under the user.
    expect(router.state.location.pathname).toBe('/this-page-does-not-exist')
  })

  it('still redirects a signed-out visitor from an unknown URL to sign in', async () => {
    const { router } = renderApp('/somewhere-random')
    expect(await screen.findByRole('heading', { level: 1, name: 'CareConnect' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('returns to the dashboard from the 404', async () => {
    const { user, router } = await signedInAt('/nope')

    await user.click(await screen.findByRole('link', { name: /go to dashboard/i }))
    expect(await screen.findByRole('heading', { level: 1, name: /sarah/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/dashboard')
  })

  it('validates the Contact Support form and records a request', async () => {
    const { user } = await signedInAt('/nope')

    await user.click(await screen.findByRole('button', { name: /contact support/i }))
    const dialog = await screen.findByRole('dialog')

    // Empty email is rejected.
    await user.click(within(dialog).getByRole('button', { name: /send message/i }))
    expect(within(dialog).getByLabelText(/your email/i)).toHaveAccessibleDescription(
      /enter your email/i,
    )

    // Malformed email is rejected.
    await user.type(within(dialog).getByLabelText(/your email/i), 'not-an-email')
    await user.click(within(dialog).getByRole('button', { name: /send message/i }))
    expect(within(dialog).getByLabelText(/your email/i)).toHaveAccessibleDescription(
      /does not look like an email/i,
    )

    // A valid submission shows the confirmation.
    await user.clear(within(dialog).getByLabelText(/your email/i))
    await user.type(within(dialog).getByLabelText(/your email/i), 'carer@example.com')
    await user.click(within(dialog).getByRole('button', { name: /send message/i }))
    expect(await screen.findByText(/your message is saved on this device/i)).toBeInTheDocument()
  })
})
