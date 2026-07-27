import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleSwitch } from './ToggleSwitch'
import { ErrorState } from './ErrorState'
import { Dialog } from './Dialog'
import { RecoveryCodePanel } from './RecoveryCodePanel'

describe('ToggleSwitch', () => {
  it('toggles through the keyboard and exposes its description', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <ToggleSwitch
        label="Email notifications"
        description="Daily logs via email"
        checked={false}
        onChange={onChange}
      />,
    )

    const control = screen.getByRole('switch', { name: /email notifications/i })
    expect(control).toHaveAttribute('aria-describedby')
    await user.click(control)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('ErrorState', () => {
  it('renders title, message, actions, and optional footer', () => {
    render(
      <ErrorState title="Missing page" message="We could not find that." footer={<p>Need help?</p>}>
        <button type="button">Go home</button>
      </ErrorState>,
    )
    expect(screen.getByRole('heading', { name: /missing page/i })).toBeInTheDocument()
    expect(screen.getByText(/could not find/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    expect(screen.getByText(/need help/i)).toBeInTheDocument()
  })
})

describe('Dialog', () => {
  it('opens, closes from the close button, and ignores closed state', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <Dialog open title="Invite caregiver" description="Send an invite" onClose={onClose}>
        <p>Invite form</p>
      </Dialog>,
    )

    expect(screen.getByRole('heading', { name: /invite caregiver/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /close invite caregiver/i }))
    expect(onClose).toHaveBeenCalled()

    rerender(
      <Dialog open={false} title="Invite caregiver" onClose={onClose}>
        <p>Invite form</p>
      </Dialog>,
    )
  })
})

describe('RecoveryCodePanel', () => {
  it('shows the recovery code and heading', () => {
    render(<RecoveryCodePanel code="ABCD-EFGH-IJKL" heading="Save your recovery code" />)

    expect(screen.getByRole('heading', { name: /save your recovery code/i })).toBeInTheDocument()
    expect(screen.getByText('ABCD-EFGH-IJKL')).toBeInTheDocument()
  })
})
