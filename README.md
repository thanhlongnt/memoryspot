# MemorySpot

A location-based memory journal web app. Pin memories to a map, attach photos and moods, and revisit them in a gallery view.

---

## Tech Stack

| Layer     | Tools                                                             |
| --------- | ----------------------------------------------------------------- |
| Front-End | React 18, TypeScript, React Router v6, Vite, MUI                 |
| Back-End  | Node.js, Express, TypeScript, Mongoose (MongoDB)                  |
| Auth      | Google OAuth 2.0 (Passport.js) + JWT (httpOnly cookie)            |
| Maps      | Google Maps JavaScript API, Places API                            |
| Testing   | Jest + Supertest + ts-jest (server), Jest + React Testing Library (client) |
| DevOps    | GitHub Actions, Prettier                                          |

---

## Project Structure

```
/
├── server/          Express + MongoDB + TypeScript API
│   ├── src/         TypeScript source (compiled to dist/)
│   └── tests/       Jest + Supertest integration tests
├── client/          React + Vite + TypeScript frontend
│   └── src/         React app source (.tsx/.ts)
└── package.json     Root monorepo scripts
```

### Server (`server/src/`)
- REST API at `/api/memories` (CRUD, auth-protected)
- Google OAuth at `/auth/google` → JWT httpOnly cookie on callback
- Google Maps API key served at `GET /api/config` (keeps key server-side)
- Models: `User` (Google profile), `Memory` (title, description, image, location, mood, dateCreated)
- Shared domain types in `src/types/shared.ts`

### Client (`client/src/`)
- `AuthContext` — three-state auth: `undefined` (loading) / `User` / `null`
- `MapsContext` — fetches API key from server, wraps app in `<LoadScript>`
- `ProtectedRoute` — wraps all routes except `/login`
- Pages: `LoginPage`, `HomePage` (map + markers), `MemoriesPage` (grid + mood filter)

---

## Getting Started

### Prerequisites

- Node.js 22.x
- MongoDB Atlas account (or local MongoDB)
- Google Cloud project with **Maps JavaScript API**, **Places API**, and **OAuth 2.0** credentials enabled

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/thanhlongnt/memoryspot.git
   cd memoryspot
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:

   Create `server/.env` (see `server/.env.example`):
   ```
   MONGO_URI=mongodb+srv://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   JWT_SECRET=...
   GOOGLE_MAPS_API_KEY=...
   CLIENT_URL=http://localhost:5173
   ```

4. Start both server and client:
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`, client on `http://localhost:5173`.

---

## Running Tests

```bash
# All tests (server + client)
npm test

# Server tests only (Jest + ts-jest)
npm run test:server
cd server && npx jest tests/memories.test.ts  # single file

# Client tests only (Jest + babel-jest)
npm run test:client
cd client && npx jest src/components/MemoryCard.test.tsx  # single file

# TypeScript type checking
cd server && npm run typecheck
cd client && npm run typecheck
```

---

## Deployment

| Service  | Target             | Notes                                      |
| -------- | ------------------ | ------------------------------------------ |
| Server   | Render or Railway  | `npm run build` then `npm start`; set env vars from `server/.env.example` |
| Client   | Vercel or Netlify  | `npm run build`; set `VITE_API_URL` to deployed server URL |
| Database | MongoDB Atlas      |                                            |

---