import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderApp } from './renderApp'

describe('routing', () => {
  it('renders the Today page at /', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/good (morning|afternoon|evening)/i)
  })

  it('renders each section at its own URL', async () => {
    const cases: [string, RegExp][] = [
      ['/reminders', /reminders/i],
      ['/routine', /your usual day/i],
      ['/people', /people you can call/i],
      ['/notes', /notes to self/i],
      ['/settings', /settings/i],
    ]

    for (const [path, heading] of cases) {
      const { unmount } = renderApp(path)
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
      unmount()
    }
  })

  it('shows a helpful not-found page for an unknown URL', async () => {
    renderApp('/does-not-exist')
    expect(await screen.findByRole('heading', { level: 1, name: /isn.t here/i })).toBeInTheDocument()
  })

  it('marks the active navigation link with aria-current', async () => {
    renderApp('/notes')
    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(within(nav).getByRole('link', { current: 'page' })).toHaveAccessibleName(/notes/i)
  })
})

describe('landmarks and page structure', () => {
  it('exposes one main landmark, a labelled primary nav, and a single h1', async () => {
    renderApp('/')
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('provides a skip link that targets the main content', async () => {
    renderApp('/')
    const skip = await screen.findByRole('link', { name: /skip to main content/i })
    expect(skip).toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
  })
})

describe('keyboard navigation', () => {
  it('reaches the skip link with the very first Tab press', async () => {
    const { user } = renderApp('/')
    await screen.findByRole('heading', { level: 1 })

    await user.tab()
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveFocus()
  })

  it('navigates with the "g then r" shortcut', async () => {
    const { user } = renderApp('/')
    await screen.findByRole('heading', { level: 1 })

    await user.keyboard('gr')
    expect(await screen.findByRole('heading', { level: 1, name: /reminders/i })).toBeInTheDocument()
  })

  // Escape-to-close is native <dialog> behaviour that jsdom does not implement,
  // so this covers the close path we own: the dialog's own close control.
  it('opens the shortcut help with "?" and closes it again', async () => {
    const { user } = renderApp('/')
    await screen.findByRole('heading', { level: 1 })

    await user.keyboard('?')
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: /keyboard shortcuts/i })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /^close$/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ignores shortcut keys while the user is typing', async () => {
    const { user } = renderApp('/notes')
    const textarea = await screen.findByLabelText(/what would you like to remember/i)

    await user.click(textarea)
    await user.type(textarea, 'gr? groceries')

    expect(textarea).toHaveValue('gr? groceries')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /notes to self/i })).toBeInTheDocument()
  })
})

describe('reminders', () => {
  it('toggles a reminder with the keyboard and reports it as checked', async () => {
    const { user } = renderApp('/reminders')
    const checkbox = await screen.findByRole('checkbox', { name: /take morning tablets/i })

    expect(checkbox).not.toBeChecked()
    checkbox.focus()
    await user.keyboard(' ')
    expect(checkbox).toBeChecked()
  })

  it('adds a reminder through the dialog form', async () => {
    const { user } = renderApp('/reminders')

    await user.click(await screen.findByRole('button', { name: /add a reminder/i }))
    await user.type(screen.getByLabelText(/what is the reminder/i), 'Water the plants')
    await user.click(screen.getByRole('button', { name: /save reminder/i }))

    expect(await screen.findByRole('checkbox', { name: /water the plants/i })).toBeInTheDocument()
  })

  it('blocks an empty reminder and links the error to the field', async () => {
    const { user } = renderApp('/reminders')

    await user.click(await screen.findByRole('button', { name: /add a reminder/i }))
    await user.click(screen.getByRole('button', { name: /save reminder/i }))

    const input = screen.getByLabelText(/what is the reminder/i)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/please give the reminder a name/i)
  })
})

describe('notes', () => {
  it('saves a note and finds it again by search', async () => {
    const { user } = renderApp('/notes')

    await user.type(
      await screen.findByLabelText(/what would you like to remember/i),
      'Bins go out on Thursday',
    )
    await user.click(screen.getByRole('button', { name: /save note/i }))
    // Scoped to <p>: the delete button carries the same text as a hidden label.
    expect(
      await screen.findByText(/bins go out on thursday/i, { selector: 'p' }),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search your notes/i), 'bins')
    expect(screen.getByText(/bins go out on thursday/i, { selector: 'p' })).toBeInTheDocument()
    expect(screen.queryByText(/spare front door key/i)).not.toBeInTheDocument()
  })
})

describe('preferences', () => {
  it('applies the chosen text size to the document element', async () => {
    const { user } = renderApp('/settings')

    await user.click(await screen.findByRole('radio', { name: /extra large/i }))
    expect(document.documentElement).toHaveAttribute('data-text-size', 'x-large')
  })

  it('persists a preference across a reload', async () => {
    const { user, unmount } = renderApp('/settings')
    await user.click(await screen.findByRole('radio', { name: /high contrast/i }))
    unmount()

    renderApp('/settings')
    expect(await screen.findByRole('radio', { name: /high contrast/i })).toBeChecked()
  })
})

describe('people', () => {
  it('offers a tel: link with an accessible name that includes the number', async () => {
    renderApp('/people')
    const call = await screen.findByRole('link', { name: /priya raman on \+1-555-0142/i })
    expect(call).toHaveAttribute('href', 'tel:+15550142')
  })
})
