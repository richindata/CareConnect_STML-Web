import { useState } from 'react'

const MAX_LENGTH = 2000

/** The reply box. Validates a non-empty, in-length message before sending. */
export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Type a message first.')
      document.getElementById('composer-input')?.focus()
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
    <form className="composer" onSubmit={handleSubmit} noValidate>
      <div className="composer__row">
        <label htmlFor="composer-input" className="visually-hidden">
          Type your message
        </label>
        <input
          id="composer-input"
          type="text"
          className="composer__input"
          placeholder="Type your message here…"
          autoComplete="off"
          maxLength={MAX_LENGTH + 200}
          value={value}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'composer-error' : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            if (error) setError('')
          }}
        />
        <button type="submit" className="composer__send" aria-label="Send message">
          <span aria-hidden="true">➤</span>
        </button>
      </div>
      {error ? (
        <p id="composer-error" className="field__error">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
    </form>
  )
}
