# Glyph

Glyph is a local-first markdown app with two surfaces:

- `apps/desktop`: the main Electron app for reading, editing, and organizing local markdown notes
- `apps/web`: the landing page and download surface for releases

## What Glyph Is

Glyph is designed to be a fast, focused markdown workspace for people who want plain files, beautiful reading, and a lightweight writing flow without turning their notes into a database.

It opens local markdown folders, lets you move quickly between notes, and keeps the experience local-first by default.

## Current Features

### Desktop app

- local workspace rooted at `Documents/Glyph` by default
- open markdown files and folders directly
- recursive sidebar with nested folders and recent files
- TipTap-based markdown editor with markdown-aware shortcuts
- autosave and safe file refresh when files change externally
- quick open and command palette with `Cmd/Ctrl+P`
- global search and file search
- theme switching and persisted settings
- markdown link navigation between notes in the same workspace
- slash actions for inserting tables, links, and images
- local image picker flow
- markdown export and PDF export
- header update CTA when a packaged update is available
- app version surfaced from runtime metadata

### Web app

- landing page for Glyph
- release/download surface for desktop builds

## Why It Exists

Glyph aims to sit in the middle ground between plain-text tools and heavyweight note systems:

- your notes stay as markdown files on disk
- the UI is optimized for reading and fast navigation
- editing stays powerful without burying the app in configuration
- desktop distribution is built around GitHub Releases instead of a complex hosted backend

## Install

### macOS with Homebrew

The Homebrew cask is kept in this repo and updated from the macOS release artifact:

```bash
brew install --cask FALAK097/glyph/glyph
```

### Direct downloads

Desktop release artifacts are published through GitHub Releases:

- macOS: `.dmg`
- Windows: `.exe`

## Requirements

- Node.js 20+
- `pnpm` 10+

## Setup

From the repo root:

```bash
pnpm install
```

## Development

Run the desktop app:

```bash
pnpm dev:desktop
```

Run the web app:

```bash
pnpm dev:web
```

Notes:

- the desktop dev flow waits for the Vite renderer before launching Electron
- macOS dev startup uses a rebranded temporary `Glyph.app` so the dock/icon experience is closer to the packaged app

## Build

Build everything:

```bash
pnpm build
```

Build desktop only:

```bash
pnpm build:desktop
```

Build web only:

```bash
pnpm build:web
```

Create a local packaged desktop build:

```bash
pnpm dist:desktop
```

## Validation

Typecheck everything:

```bash
pnpm typecheck
```

Lint everything:

```bash
pnpm lint
```

Check formatting:

```bash
pnpm fmt:check
```

## Release Flow

Glyph now has a release pipeline built around GitHub Actions, Release Please, `electron-builder`, and `electron-updater`.

### Versioning and changelog

- Release Please manages version bumps from commit history
- the root [CHANGELOG.md](/Users/falakgala/projects/glyph/CHANGELOG.md) is generated and kept in sync with releases

### Desktop releases

- tagged releases build macOS and Windows artifacts
- GitHub Releases is the publish target for desktop installers and updater metadata
- packaged desktop builds can receive update state and show an update CTA inside the app header

### Homebrew

- the Homebrew cask lives in [Casks/glyph.rb](/Users/falakgala/projects/glyph/Casks/glyph.rb)
- the generator script at [scripts/generate-homebrew-cask.mjs](/Users/falakgala/projects/glyph/scripts/generate-homebrew-cask.mjs) computes the SHA from the real macOS DMG
- the release workflow updates the cask after tagged macOS releases

## Project Layout

```text
glyph/
├── apps/
│   ├── desktop/
│   │   ├── electron/
│   │   ├── public/
│   │   ├── scripts/
│   │   └── src/
│   └── web/
│       └── src/
├── .github/workflows/
├── Casks/
├── scripts/
├── CHANGELOG.md
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Repository Scripts

From the repo root:

```bash
pnpm dev:desktop
pnpm dev:web
pnpm build
pnpm build:desktop
pnpm build:web
pnpm dist:desktop
pnpm typecheck
pnpm lint
pnpm fmt:check
pnpm cask:generate --version <version> --artifact-path apps/desktop/release/Glyph-<version>-mac.dmg
```

## Status

Already shipped:

- local markdown workspace flow
- single-pane editor and reading experience
- command palette, search, recent files, and themes
- markdown/PDF export
- release workflow, updater plumbing, and changelog automation

Still planned:

- drag-and-drop image support
- TOC and more document-navigation polish
- smarter ranking/history in the command palette
- typography, motion, and bundle-size refinements
- production deployment of the web landing page
