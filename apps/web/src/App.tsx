export function App() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <p className="landing-eyebrow">Markdown, without the bloat</p>
        <h1>Typist</h1>
        <p className="landing-copy">
          A minimal markdown viewer and editor for macOS and Windows. Browse local notes, edit markdown fast, and read
          rendered documents in a focused desktop workspace.
        </p>
        <div className="landing-actions">
          <a className="primary-button landing-button" href="/downloads/typist-macos.dmg">
            Download for macOS
          </a>
          <a className="secondary-button landing-button" href="/downloads/typist-windows.exe">
            Download for Windows
          </a>
        </div>
        <p className="landing-meta">These links are placeholders until desktop packaging is wired up.</p>
      </section>

      <section className="landing-grid">
        <article className="landing-card">
          <p className="landing-card-label">Viewer</p>
          <h2>Beautiful markdown rendering</h2>
          <p>Readable typography, code blocks, tables, task lists, and a clean document surface for local files.</p>
        </article>
        <article className="landing-card">
          <p className="landing-card-label">Editor</p>
          <h2>Desktop-first note workflow</h2>
          <p>Open folders, browse notes from the sidebar, create new markdown files, and keep edits live as you work.</p>
        </article>
        <article className="landing-card">
          <p className="landing-card-label">Roadmap</p>
          <h2>Search, themes, export</h2>
          <p>The repo is now split into desktop and web apps so product features and distribution can evolve cleanly.</p>
        </article>
      </section>
    </main>
  );
}
