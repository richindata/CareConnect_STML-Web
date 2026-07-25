export function AboutSection() {
  return (
    <section aria-labelledby="about-heading">
      <header className="section-head">
        <h2 id="about-heading">About</h2>
        <p>CareConnect — a coursework prototype for SWEN 661.</p>
      </header>

      <dl className="about-list">
        <div className="about-row">
          <dt>Version</dt>
          <dd>1.0.0 (prototype)</dd>
        </div>
        <div className="about-row">
          <dt>Data</dt>
          <dd>Stored only in this browser. Nothing is sent to a server.</dd>
        </div>
        <div className="about-row">
          <dt>Status</dt>
          <dd>Not a medical device. Do not rely on it for clinical decisions.</dd>
        </div>
      </dl>

      <p className="about-note">
        Works offline once loaded, and can be installed to your device from the browser menu.
      </p>
    </section>
  )
}
