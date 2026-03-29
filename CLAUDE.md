# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From repo root
npm run install:all          # Install server + client deps
npm run dev                  # Run server (ts-node-dev) + client (Vite) concurrently
npm test                     # Run all tests (server then client)
npm run test:server          # Server tests only
npm run test:client          # Client tests only

# From server/
npm test                     # Jest + ts-jest (runs server/tests/*.test.ts)
npx jest tests/auth.test.ts  # Run a single server test file
npm run typecheck            # tsc --noEmit against server/src/
npm run build                # Compile to server/dist/
npm run dev                  # ts-node-dev src/index.ts

# From client/
npm test                     # Jest + babel-jest (runs src/**/*.test.tsx)
npx jest src/components/MemoryCard.test.tsx  # Run a single client test file
npm run typecheck            # tsc --noEmit against client/src/ (excludes test files)
npm run build                # Vite production build

# Formatting (run from either package directory)
npx prettier --write .
npx prettier . --check       # Run by CI on PRs
```

## Architecture

**MemorySpot** is a full-stack MERN app. The server is Express + Mongoose + Passport.js (Google OAuth) + JWT. The client is React 18 + Vite + MUI. Both packages are fully TypeScript.

### Monorepo layout

```
server/src/          TypeScript source (compiled to server/dist/)
server/tests/        Integration tests (ts-jest, NOT in src/)
client/src/          React app (Vite handles TS compilation; tsc only type-checks)
source/              Legacy vanilla JS app — do not modify
```

### Auth flow

Google OAuth via Passport.js (`/auth/google` → `/auth/google/callback`). On success, a 7-day JWT is set as an httpOnly cookie (`token`). All subsequent API calls are authenticated via `server/src/middleware/auth.ts`, which reads the token from the `Authorization: Bearer` header or the `token` cookie and attaches `req.userId`.

### Server source structure (`server/src/`)

- **`types/shared.ts`** — canonical domain types (`Mood`, `Memory`, `MemoryMarker`, `MemoryPayload`, `User`) shared with the client via identical copy at `client/src/types/shared.ts`
- **`types/express.d.ts`** — augments `Express.Request` with `userId?: string`
- **`models/`** — Mongoose models; `User.ts` exports `IUser`/`UserDocument`, `Memory.ts` exports `IMemory`/`MemoryDocument`
- **`routes/memories.ts`** — all routes apply `authMiddleware` via `router.use()`; userId-scoped queries throughout
- **`index.ts`** — exports `app` for test imports; `start()` is called only in the main module

### Client data flow

- **`AuthContext`** — three-state: `undefined` (loading) → `User` (logged in) → `null` (logged out). All auth-gated UI checks `user === undefined` to show nothing during load.
- **`MapsContext`** — discriminated union: `{ isLoaded: false; noKey?: boolean } | { isLoaded: true }`. Fetches the Maps API key from `GET /api/config` on mount, then wraps children in `<LoadScript>`.
- **`api/`** — thin Axios wrappers typed with the shared domain interfaces. `memories.ts` and `auth.ts` are the only files that call the server.

### TypeScript config

- **Server**: `tsconfig.json` (`rootDir: src/`, strict, CommonJS) + `tsconfig.test.json` (extends main, adds `"types": ["jest","node"]`, widens rootDir to include `tests/`)
- **Client**: `tsconfig.json` (`moduleResolution: bundler`, `noEmit: true`, excludes `*.test.tsx`) — Vite compiles; `tsc` only type-checks. `vite-env.d.ts` provides CSS import types.

### CI/CD

Three workflows in `.github/workflows/`:
1. `unit-tests.yml` — parallel `test-server` and `test-client` jobs; each runs typecheck then tests
2. `format-check.yml` — Prettier check on PRs for both packages
3. `deploy.yml` — Vite build on push to main (deployment via Vercel/Netlify)
