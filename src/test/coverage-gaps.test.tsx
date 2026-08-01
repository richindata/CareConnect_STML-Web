import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { renderApp } from './renderApp'
import { createAccount, writeSession } from '../lib/auth'
import { createId } from '../lib/storage'
import { Dialog } from '../components/Dialog'
import { ErrorPage } from '../pages/ErrorPage'
import { AnnouncerProvider } from '../context/AnnouncerProvider'
import { SupportProvider } from '../context/SupportProvider'
import { AuthProvider } from '../context/AuthProvider'
import { __resetPwaStub, __setNeedRefresh } from './pwa-register-stub'
import { setViewportWidth } from './setup'

async function seedSignedIn(
  {
    email = 'coverage@example.com',
    fullName = 'Coverage User',
    caringFor = 'Eleanor',
    password = 'correct-horse',
  } = {},
) {
  await createAccount({ fullName, email, password, caringFor })
  writeSession({ email, fullName, caringFor })
}

describe('coverage gaps — settings sections', () => {
  beforeEach(async () => {
    await seedSignedIn()
  })

  it('visits Privacy and About, and saves privacy preferences', async () => {
    const { user, router } = renderApp('/settings/privacy')
    expect(await screen.findByRole('heading', { name: /^privacy$/i })).toBeInTheDocument()

    const share = screen.getByRole('switch', { name: /share care log with team/i })
    await user.click(share)
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument()

    const sections = screen.getByRole('navigation', { name: /settings sections/i })
    await user.click(within(sections).getByRole('link', { name: /^about$/i }))
    expect(router.state.location.pathname).toBe('/settings/about')
    expect(await screen.findByRole('heading', { name: /^about$/i })).toBeInTheDocument()
    expect(screen.getByText(/not a medical device/i)).toBeInTheDocument()
  })

  it('saves account details and care preferences', async () => {
    const { user } = renderApp('/settings/account')
    expect(await screen.findByRole('heading', { name: /^account$/i })).toBeInTheDocument()

    const name = screen.getByLabelText(/your name/i)
    await user.clear(name)
    await user.type(name, 'Coverage Updated')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(await screen.findByText(/✓ saved/i)).toBeInTheDocument()

    const sections = screen.getByRole('navigation', { name: /settings sections/i })
    await user.click(within(sections).getByRole('link', { name: /care preferences/i }))
    expect(await screen.findByRole('heading', { name: /care preferences/i })).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/remind me before/i), '60')
    await user.clear(screen.getByLabelText(/from/i))
    await user.type(screen.getByLabelText(/from/i), '21:00')
    await user.clear(screen.getByLabelText(/^to$/i))
    await user.type(screen.getByLabelText(/^to$/i), '06:00')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
  })

  it('clears account field errors as the user types', async () => {
    const { user } = renderApp('/settings/account')
    await screen.findByRole('heading', { name: /^account$/i })

    await user.clear(screen.getByLabelText(/your name/i))
    await user.clear(screen.getByLabelText(/caring for/i))
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(screen.getByLabelText(/your name/i)).toHaveFocus()

    await user.type(screen.getByLabelText(/your name/i), 'A')
    expect(screen.queryByText(/enter your name/i)).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/caring for/i), 'B')
    expect(screen.queryByText(/enter who you are caring for/i)).not.toBeInTheDocument()
  })
})

describe('coverage gaps — dialogs and removals', () => {
  beforeEach(async () => {
    await seedSignedIn()
  })

  it('cancels add-task and add-reminder dialogs after a validation attempt', async () => {
    const myDay = renderApp('/my-day')
    await screen.findByRole('heading', { level: 1 })

    await myDay.user.click(screen.getByRole('button', { name: /add task/i }))
    const taskDialog = await screen.findByRole('dialog')
    await myDay.user.click(within(taskDialog).getByRole('button', { name: /^add task$/i }))
    await myDay.user.type(within(taskDialog).getByLabelText(/task/i, { selector: '#task-title' }), 'Walk')
    await myDay.user.type(within(taskDialog).getByLabelText(/time/i), '10:00')
    await myDay.user.selectOptions(within(taskDialog).getByLabelText(/assigned to/i), 'Nurse Jenny')
    await myDay.user.click(within(taskDialog).getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    myDay.unmount()

    const reminders = renderApp('/reminders')
    await screen.findByRole('heading', { level: 1 })
    await reminders.user.click(screen.getByRole('button', { name: /add reminder/i }))
    const reminderDialog = await screen.findByRole('dialog')
    await reminders.user.click(within(reminderDialog).getByRole('button', { name: /^add reminder$/i }))
    await reminders.user.type(within(reminderDialog).getByLabelText(/what is the reminder/i), 'Water')
    await reminders.user.type(within(reminderDialog).getByLabelText(/time/i), '11:00')
    await reminders.user.selectOptions(within(reminderDialog).getByLabelText(/what kind/i), 'hydration')
    await reminders.user.type(within(reminderDialog).getByLabelText(/anything to remember/i), 'Glass by the bed')
    await reminders.user.click(within(reminderDialog).getByRole('button', { name: /cancel/i }))
  })

  it('keeps a medication and reminder when removal is cancelled', async () => {
    const meds = renderApp('/meds')
    await screen.findByRole('heading', { level: 1 })
    await meds.user.click(screen.getAllByRole('button', { name: /remove/i })[0])
    const medDialog = await screen.findByRole('dialog')
    await meds.user.click(within(medDialog).getByRole('button', { name: /keep it/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    meds.unmount()

    const reminders = renderApp('/reminders')
    await screen.findByRole('heading', { level: 1 })
    await reminders.user.click(screen.getAllByRole('button', { name: /remove/i })[0])
    const remDialog = await screen.findByRole('dialog')
    await reminders.user.click(within(remDialog).getByRole('button', { name: /keep it/i }))
  })

  it('refreshes an existing care-team invite instead of duplicating it', async () => {
    const { user } = renderApp('/care-team')
    await screen.findByRole('heading', { level: 1 })

    await user.click(screen.getByRole('button', { name: /invite caregiver/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/email address/i), 'repeat@example.com')
    await user.selectOptions(within(dialog).getByLabelText(/role/i), 'Family Member')
    await user.click(within(dialog).getByRole('button', { name: /send invitation/i }))

    await user.click(screen.getByRole('button', { name: /invite caregiver/i }))
    const again = await screen.findByRole('dialog')
    await user.type(within(again).getByLabelText(/email address/i), 'repeat@example.com')
    await user.selectOptions(within(again).getByLabelText(/role/i), 'Registered Nurse')
    await user.click(within(again).getByRole('button', { name: /send invitation/i }))

    expect(screen.getByText('repeat@example.com')).toBeInTheDocument()
    expect(screen.getByText(/invited as registered nurse/i)).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: /resend/i })[0])
  })
})

describe('coverage gaps — ErrorPage and PWA chrome', () => {
  afterEach(() => {
    __resetPwaStub()
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true })
  })

  it('renders ErrorPage for thrown route errors and Error responses', async () => {
    const user = userEvent.setup()
    const Boom = () => {
      throw new Error('kaboom')
    }
    const router = createMemoryRouter(
      [{ path: '/', element: <Boom />, errorElement: <ErrorPage /> }],
      { initialEntries: ['/'] },
    )

    render(
      <AnnouncerProvider>
        <SupportProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </SupportProvider>
      </AnnouncerProvider>,
    )

    expect(await screen.findByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
    expect(screen.getByRole('code')).toHaveTextContent(/kaboom/i)

    await user.click(screen.getByRole('button', { name: /contact support/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('shows offline and update bars from PwaStatus', async () => {
    await seedSignedIn()
    __setNeedRefresh(true)
    const { user } = renderApp('/dashboard')
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByText(/newer version of careconnect is ready/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /later/i }))

    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    window.dispatchEvent(new Event('offline'))
    await waitFor(() =>
      expect(screen.getByText(/you are offline/i)).toBeInTheDocument(),
    )

    const installEvent = new Event('beforeinstallprompt') as Event & {
      preventDefault: () => void
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    installEvent.preventDefault = vi.fn()
    installEvent.prompt = vi.fn(async () => undefined)
    installEvent.userChoice = Promise.resolve({ outcome: 'dismissed' })
    window.dispatchEvent(installEvent)

    expect(await screen.findByRole('button', { name: /add to device/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /add to device/i }))
  })

  it('opens the missing-conversation branch and compose validation', async () => {
    setViewportWidth(1440)
    await seedSignedIn()
    const { user, router } = renderApp('/mail/does-not-exist')
    expect(await screen.findByRole('heading', { name: /conversation not found/i })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/mail/does-not-exist')

    await user.click(screen.getByRole('button', { name: /new message/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^send$/i }))
    expect(within(dialog).getByLabelText(/^message/i)).toHaveAttribute('aria-invalid', 'true')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))
  })

  it('covers support dialog success path', async () => {
    await seedSignedIn()
    const { user } = renderApp('/not-a-real-page')
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /need help/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/your email/i), 'help@example.com')
    // Message is prefilled for 404; submit should succeed.
    await user.click(within(dialog).getByRole('button', { name: /send message/i }))
    expect(await screen.findByText(/thanks — your message is saved/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^done$/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('rejects overlong Ask AI prompts and toggles a dose back off', async () => {
    await seedSignedIn()
    const ai = renderApp('/ai')
    await screen.findByRole('heading', { level: 1 })

    const input = screen.getByLabelText(/ask about care plans/i)
    const long = 'x'.repeat(501)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    nativeInputValueSetter?.call(input, long)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await ai.user.click(screen.getByRole('button', { name: /send question/i }))
    expect(screen.getByText(/keep it under 500 characters/i)).toBeInTheDocument()
    ai.unmount()

    const meds = renderApp('/meds')
    await screen.findByRole('heading', { level: 1 })
    const taken = screen.getAllByRole('checkbox', { name: /taken/i })[0]
    await meds.user.click(taken)
  })
})

describe('coverage gaps — context guards', () => {
  it('throws when hooks are used outside their providers', async () => {
    const { useAuth } = await import('../context/AuthProvider')
    const { useAnnouncer } = await import('../context/AnnouncerProvider')
    const { useMail } = await import('../context/MailProvider')
    const { useSupport } = await import('../context/SupportProvider')
    const { useSettings } = await import('../context/SettingsProvider')
    const { useCareTeam } = await import('../context/CareTeamProvider')
    const { useMeds } = await import('../context/MedsProvider')
    const { useMyDay } = await import('../context/MyDayProvider')
    const { useReminders } = await import('../context/RemindersProvider')
    const { useAssistant } = await import('../context/AssistantProvider')

    const hooks = [
      useAuth,
      useAnnouncer,
      useMail,
      useSupport,
      useSettings,
      useCareTeam,
      useMeds,
      useMyDay,
      useReminders,
      useAssistant,
    ]

    for (const hook of hooks) {
      expect(() => renderHook(hook as () => unknown)).toThrow(/must be used inside/i)
    }
  })

  it('fills optional medication instructions and clears compose recipient errors', async () => {
    await seedSignedIn()
    const meds = renderApp('/meds')
    await screen.findByRole('heading', { level: 1 })
    await meds.user.click(screen.getByRole('button', { name: /add medication/i }))
    const dialog = await screen.findByRole('dialog')
    await meds.user.type(within(dialog).getByLabelText(/medication name/i), 'Ibuprofen')
    await meds.user.type(within(dialog).getByLabelText(/^dose/i), '200 mg')
    await meds.user.selectOptions(within(dialog).getByLabelText(/how often/i), 'once')
    await meds.user.type(within(dialog).getByLabelText(/instructions/i), 'After meals')
    await meds.user.click(within(dialog).getByRole('button', { name: /cancel/i }))
    meds.unmount()

    setViewportWidth(1440)
    const mail = renderApp('/mail')
    await screen.findByRole('heading', { name: 'Dr. Martinez' })
    await mail.user.click(screen.getByRole('button', { name: /new message/i }))
    const compose = await screen.findByRole('dialog')
    await mail.user.click(within(compose).getByRole('button', { name: /^send$/i }))
    expect(within(compose).getByLabelText(/^to/i)).toHaveAttribute('aria-invalid', 'true')
    await mail.user.selectOptions(within(compose).getByLabelText(/^to/i), 'c-jenny')
    expect(within(compose).getByLabelText(/^to/i)).not.toHaveAttribute('aria-invalid')
    await mail.user.click(within(compose).getByRole('button', { name: /cancel/i }))
  })

  it('covers dialog backdrop close and storage id fallback', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Dialog open title="Backdrop" onClose={onClose}>
        <p>Inside</p>
      </Dialog>,
    )
    await user.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalled()

    const uuid = crypto.randomUUID.bind(crypto)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (crypto as any).randomUUID
    expect(createId('x')).toMatch(/^x_/)
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: uuid })
  })
})
