const AppleIcon = () => (
  <svg
    viewBox="0 0 384 512"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    height="18"
    width="18"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 56-12 69.5-34.3z" />
  </svg>
);

const WindowsIcon = () => (
  <svg
    viewBox="0 0 88 88"
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    width="18"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="m0 12.402 35.687-4.86.016 34.423-35.67.203zm35.67 33.529.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349-.011 41.34-47.318-6.678-.066-34.739z"
      fill="currentColor"
    />
  </svg>
);

const features = [
  {
    eyebrow: "Organization",
    title: "Folders + Editing",
    description:
      "Open entire directories and manage your markdown library in one focused editor designed for long-form writing.",
    className: "md:col-span-8",
    tone: "bg-[#efeee9]",
    media: true,
  },
  {
    eyebrow: "Privacy",
    title: "Local-First",
    description:
      "Your notes stay on your device. No accounts, no forced sync, and no cloud dependency between you and your files.",
    className: "md:col-span-4",
    tone: "bg-[#4b4b4b] text-[#faf9f5]",
  },
  {
    eyebrow: "Native",
    title: "QuickLook",
    description:
      "Preview markdown files right in Finder. Press Space on any .md file and read instantly.",
    className: "md:col-span-4",
    tone: "bg-[#efeee9]",
  },
  {
    eyebrow: "Discovery",
    title: "Search Everything",
    description: "Search all your markdown files in one place and find the exact note you need in seconds.",
    className: "md:col-span-4",
    tone: "border border-black/10 bg-white shadow-[0_20px_60px_-48px_rgba(0,0,0,0.45)]",
  },
  {
    eyebrow: "Ethics",
    title: "Open Source",
    description:
      "Glyph is transparent and community-friendly. Inspect the code, contribute improvements, or adapt it to your workflow.",
    className: "md:col-span-4",
    tone: "bg-[#e6e5e3]",
  },
  {
    eyebrow: "Workflow",
    title: "Keyboard Shortcuts",
    description:
      "Built for speed, with fast navigation and commands that keep your hands on the keyboard.",
    className: "md:col-span-5",
    tone: "bg-[#efeee9]",
    image: {
      src: "/keyboard-shortcut.png",
      alt: "Glyph keyboard shortcuts interface preview",
    },
  },
  {
    eyebrow: "Visuals",
    title: "Syntax Highlighting",
    description:
      "Readable markdown structure and code blocks make it easier to scan, edit, and stay oriented while writing.",
    className: "md:col-span-7",
    tone: "border border-black/10 bg-white shadow-[0_20px_60px_-48px_rgba(0,0,0,0.45)]",
    image: {
      src: "/syntax-highlighting.png",
      alt: "Glyph syntax highlighting preview",
    },
  },
  {
    eyebrow: "Appearance",
    title: "Light & Dark Themes",
    description:
      "Carefully tuned themes for every lighting condition, whether you are writing in daylight or reviewing notes late at night.",
    className: "md:col-span-12",
    tone: "bg-[#efeee9]",
    themes: true,
  },
];

export function App() {
  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#2f342e] [font-family:'Manrope',ui-sans-serif,sans-serif]">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#2f342e] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#fbfaf6]"
        href="#main-content"
      >
        Skip to content
      </a>

      <nav className="sticky top-0 z-40 bg-transparent">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8 lg:px-12">
          <a
            href="/"
            aria-label="Glyph Home"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbfaf6]"
          >
            <img
              src="/logo-wordmark-dark.png"
              alt="Glyph"
              width="510"
              height="314"
              className="h-14 w-auto sm:h-16"
            />
          </a>

          <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
            <a
              href="/downloads/glyph-macos.dmg"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#2f342e] px-5 py-2.5 text-sm font-semibold text-[#faf9f5] shadow-[0_20px_45px_-28px_rgba(0,0,0,0.55)] transition-colors duration-150 ease-out hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbfaf6]"
            >
              <AppleIcon />
              Download for macOS
            </a>
            <a
              href="/downloads/glyph-windows.exe"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/12 bg-white px-5 py-2.5 text-sm font-semibold text-[#2f342e] transition-colors duration-150 ease-out hover:bg-[#f5f3ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbfaf6]"
            >
              <WindowsIcon />
              Download for Windows
            </a>
          </div>
        </div>
      </nav>

      <header className="mx-auto max-w-screen-2xl px-6 pb-20 pt-18 sm:px-8 sm:pt-22 lg:px-12 lg:pb-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#6b6b68]">
            The Interface of Thought
          </span>
          <h1
            id="main-content"
            className="mt-6 max-w-[10ch] text-balance [font-family:'Newsreader',ui-serif,serif] text-6xl leading-[0.92] tracking-[-0.045em] text-[#1f211e] sm:text-7xl lg:text-[7rem]"
          >
            Designed for the <em className="italic">discerning</em> writer.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-9 text-[#5f5e5e] sm:text-xl">
            Glyph strips away digital noise, leaving only your words, your folders,
            and a reading experience built for clarity.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-screen-2xl px-6 pb-32 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:auto-rows-[minmax(300px,_auto)]">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`${feature.className} ${feature.tone} flex flex-col justify-between p-8 sm:p-10 lg:p-12`}
            >
              <div className="max-w-md">
                <span
                  className={`block text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${
                    feature.title === "Local-First" ? "text-white/65" : "text-[#787c75]"
                  }`}
                >
                  {feature.eyebrow}
                </span>
                <h2
                  className={`mt-6 [font-family:'Newsreader',ui-serif,serif] text-4xl leading-tight tracking-[-0.035em] ${
                    feature.title === "Local-First" ? "text-[#faf9f5]" : "text-[#2f342e]"
                  } ${feature.title === "Search Everything" || feature.title === "Light & Dark Themes" ? "italic" : ""}`}
                >
                  {feature.title}
                </h2>
                <p
                  className={`mt-4 text-sm leading-7 sm:text-[0.97rem] ${
                    feature.title === "Local-First" ? "text-white/80" : "text-[#5f5e5e]"
                  }`}
                >
                  {feature.description}
                </p>
              </div>

              {feature.media ? (
                <div className="mt-12 overflow-hidden border border-black/8 bg-white shadow-[0_24px_70px_-48px_rgba(0,0,0,0.45)]">
                  <img
                    src="/demo.png"
                    alt="Glyph interface preview"
                    width="2880"
                    height="1800"
                    className="h-64 w-full object-cover object-top sm:h-72"
                  />
                </div>
              ) : null}

              {feature.image ? (
                <div
                  className={`mt-10 overflow-hidden border border-black/8 bg-white shadow-sm ${
                    feature.title === "Keyboard Shortcuts"
                      ? "mx-auto max-w-[34rem]"
                      : "mx-auto max-w-[38rem]"
                  }`}
                >
                  <img
                    src={feature.image.src}
                    alt={feature.image.alt}
                    width="2880"
                    height="1800"
                    className={`w-full object-cover ${
                      feature.title === "Keyboard Shortcuts"
                        ? "h-56 object-top sm:h-60"
                        : "h-56 object-center sm:h-60"
                    }`}
                  />
                </div>
              ) : null}

              {feature.themes ? (
                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                  <div className="overflow-hidden border border-black/8 bg-white shadow-[0_24px_70px_-48px_rgba(0,0,0,0.45)]">
                    <img
                      src="/light-theme.png"
                      alt="Glyph light theme preview"
                      width="2880"
                      height="1800"
                      className="h-64 w-full object-cover object-top"
                    />
                  </div>
                  <div className="overflow-hidden border border-black/8 bg-white shadow-[0_24px_70px_-48px_rgba(0,0,0,0.45)]">
                    <img
                      src="/dark-theme.png"
                      alt="Glyph dark theme preview"
                      width="2880"
                      height="1800"
                      className="h-64 w-full object-cover object-top"
                    />
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[#fbfaf6]">
        <div className="mx-auto max-w-screen-2xl px-6 py-10 text-center sm:px-8 lg:px-12">
          <div className="mx-auto mb-8 h-px max-w-4xl bg-black/10" />
          <p className="text-[0.78rem] font-medium tracking-[0.03em] text-[#5f5e5e]">
            Made by{" "}
            <a
              href="https://falakgala.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 ease-out hover:text-[#2f342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbfaf6]"
            >
              Falak Gala
            </a>
            <span className="px-2">·</span>
            <a
              href="https://github.com/FALAK097/glyph"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 ease-out hover:text-[#2f342e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fbfaf6]"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

export default App;
