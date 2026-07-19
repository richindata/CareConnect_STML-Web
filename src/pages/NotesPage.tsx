import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../context/AppDataProvider'
import { useAnnouncer } from '../context/AnnouncerProvider'
import { formatDateTime } from '../lib/format'

export function NotesPage() {
  const { data, addNote, removeNote } = useAppData()
  const { announce } = useAnnouncer()

  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return data.notes
    return data.notes.filter((note) => note.body.toLowerCase().includes(needle))
  }, [data.notes, query])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body) {
      setError('Please write something first.')
      document.getElementById('note-body')?.focus()
      return
    }
    addNote(body)
    setDraft('')
    setError('')
    announce('Note saved.')
  }

  return (
    <>
      <PageHeader
        title="Notes to self"
        intro="Anything worth writing down — where things are kept, who visited, what was said."
      />

      <section className="card" aria-labelledby="new-note-heading">
        <h2 id="new-note-heading">Write a new note</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="note-body">What would you like to remember?</label>
            <textarea
              id="note-body"
              value={draft}
              required
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'note-body-error' : undefined}
              onChange={(event) => {
                setDraft(event.target.value)
                if (error) setError('')
              }}
            />
            {error ? (
              <p id="note-body-error" className="field__error">
                <span aria-hidden="true">⚠</span>
                {error}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Save note
          </button>
        </form>
      </section>

      <section className="section" aria-labelledby="saved-notes-heading">
        <div className="section__header">
          <h2 id="saved-notes-heading">Saved notes</h2>
        </div>

        <div className="field">
          <label htmlFor="note-search">Search your notes</label>
          <input
            id="note-search"
            type="search"
            value={query}
            data-search-input
            autoComplete="off"
            aria-describedby="note-search-hint"
            onChange={(event) => setQuery(event.target.value)}
          />
          <p id="note-search-hint" className="field__hint">
            Press <kbd>/</kbd> from anywhere to jump straight here.
          </p>
        </div>

        {/* Result count is a live region so it is announced as the query changes. */}
        <p role="status" aria-live="polite" className="field__hint">
          {query.trim()
            ? `${results.length} ${results.length === 1 ? 'note' : 'notes'} match “${query.trim()}”.`
            : `${data.notes.length} ${data.notes.length === 1 ? 'note' : 'notes'} saved.`}
        </p>

        {results.length === 0 ? (
          <p className="empty-state">
            {data.notes.length === 0
              ? 'No notes yet. Write your first one above.'
              : 'No notes match that search.'}
          </p>
        ) : (
          <ul className="task-list">
            {results.map((note) => (
              <li key={note.id} className="task">
                <div className="task__body">
                  <p>{note.body}</p>
                  <p className="task__meta">
                    <time dateTime={note.createdAt}>Written {formatDateTime(note.createdAt)}</time>
                  </p>
                </div>
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => {
                    removeNote(note.id)
                    announce('Note deleted.')
                  }}
                >
                  <span aria-hidden="true">🗑</span>
                  <span className="visually-hidden">
                    Delete note: {note.body.slice(0, 60)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
