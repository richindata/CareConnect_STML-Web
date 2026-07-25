import { useState } from 'react'

const MAX_LENGTH = 500

/** The chat composer. Validates a non-empty, in-length question before sending. */
export function AskInput({ onSend }: { onSend: (prompt: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Type a question first.')
      document.getElementById('ask-input')?.focus()
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Please keep it under ${MAX_LENGTH} characters.`)
      return
    }
    onSend(trimmed)
    setValue('')
    setError('')
  }

  return (
    <form className="ask-form" onSubmit={handleSubmit} noValidate>
      <div className="ask-form__row">
        <label htmlFor="ask-input" className="visually-hidden">
          Ask about care plans, medications, or schedules
        </label>
        <input
          id="ask-input"
          type="text"
          className="ask-form__input"
          placeholder="Ask about care plans, medications, schedules…"
          autoComplete="off"
          maxLength={MAX_LENGTH + 100}
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'ask-input-error' : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            if (error) setError('')
          }}
        />
        <button type="submit" className="ask-form__send" aria-label="Send question">
          <span aria-hidden="true">➤</span>
        </button>
      </div>
      {error ? (
        <p id="ask-input-error" className="field__error">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
    </form>
  )
}
