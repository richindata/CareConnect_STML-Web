interface RecoveryCodePanelProps {
  code: string
  heading: string
}

/**
 * Shows a freshly issued recovery code. It is the only time the code is ever
 * displayed — only its hash is stored — so the copy leans hard on writing it
 * down before moving on.
 */
export function RecoveryCodePanel({ code, heading }: RecoveryCodePanelProps) {
  return (
    <section className="recovery" aria-labelledby="recovery-heading">
      <h2 id="recovery-heading" className="recovery__heading">
        {heading}
      </h2>
      <p className="recovery__body">
        Write this down and keep it somewhere safe. It is the only way to reset your password, and
        it will not be shown again.
      </p>
      <p className="recovery__code">
        <span className="visually-hidden">Your recovery code is </span>
        <code>{code}</code>
      </p>
    </section>
  )
}
