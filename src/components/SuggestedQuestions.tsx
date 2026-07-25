import { SUGGESTIONS } from '../lib/assistant'

/** Quick-start prompts. Each is a button that sends its prompt straight away. */
export function SuggestedQuestions({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <aside className="panel suggestions" aria-labelledby="suggestions-heading">
      <h2 id="suggestions-heading" className="suggestions__heading">
        Suggested questions
      </h2>
      <ul className="suggestions__list">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion.id}>
            <button
              type="button"
              className="suggestions__item"
              onClick={() => onPick(suggestion.prompt)}
            >
              <span className="suggestions__icon" aria-hidden="true">
                💬
              </span>
              {suggestion.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
