# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `source/` directory:

```bash
npm test                    # Run all Jest unit tests
npx jest <file>             # Run a single test file (e.g., npx jest tests/addMemory.test.js)
npm run test:e2e            # Run Puppeteer end-to-end tests
npm run docs                # Generate JSDoc documentation to source/docs/
npx prettier --write .      # Format all code (required before committing)
npx prettier . --check      # Check formatting (run by CI on PRs)
```

There is no build step — the app is plain HTML/CSS/JS with no bundler.

## Architecture

**MemorySpot** is a local-first progressive web app using vanilla JavaScript, native Web Components, and IndexedDB for offline-capable memory storage with Google Maps integration.

### Pages & Entry Points

- `source/index.html` + `source/scripts/index.js` — Home page: Google Maps view with memory markers and a sidebar modal
- `source/memories.html` + `source/scripts/memories.js` — Gallery view of all memories with mood filtering
- `source/create.html` + `source/scripts/create.js` — Create/edit memory form with image upload and location autocomplete

### Key Modules (`source/scripts/modules/`)

- **`dbFunctions.js`** — All IndexedDB CRUD operations (add, get, update, delete). The DB is named `MemoryDB` with an object store `memories` (keyPath: `post_id`, auto-increment; index: `dateCreated`).
- **`map.js`** — Google Maps initialization, marker rendering, Places API autocomplete for location input
- **`cards.js`** — Web Component definitions (`<memory-data>`, `<memory-photo>`, `<card-meta>`, etc.) using Shadow DOM for style encapsulation
- **`cardTemplate.js`** — Functions that generate HTML strings for card components
- **`dataDisplay.js`** — Renders memory cards to the DOM, handles mood-based filtering

### Data & State

- **IndexedDB (`MemoryDB`)**: Primary storage for all memories. Schema: `{ post_id, title, description, image (base64), location, latitude, longitude, mood, dateCreated }`
- **localStorage**: Persists `googleMapsApiKey` and per-memory button toggle states (`memory:<id>:<type>`)
- Google Maps API key is entered by the user at runtime and stored in localStorage — it is never hard-coded

### Testing

Unit tests use Jest with a custom IndexedDB mock at `source/tests/mocks/indexedDBMock.js`. E2E tests use Puppeteer. CI runs unit tests on every push/PR and blocks merges if they fail. Prettier format checks also block PRs if they fail.

### CI/CD

Three GitHub Actions workflows in `.github/workflows/`:
1. `unit-tests.yml` — Jest tests on push and PR
2. `format-check.yml` — Prettier check on PRs only
3. `deploy.yml` — Generates JSDoc docs and deploys to GitHub Pages

The app is deployed at `https://cse110-sp25-group24.github.io/cse110-sp25-group24/`.
