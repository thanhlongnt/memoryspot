# MemorySpot

A location-based memory journal web app. Pin memories to a map, attach photos and moods, and revisit them in a gallery view.

---

## Tech Stack

| Layer     | Tools                                              |
| --------- | -------------------------------------------------- |
| Front-End | React 18, React Router v6, Vite, CSS Modules       |
| Back-End  | Node.js, Express, Mongoose (MongoDB)               |
| Auth      | Google OAuth 2.0 (Passport.js) + JWT (httpOnly cookie) |
| Maps      | Google Maps JavaScript API, Places API             |
| Testing   | Jest + Supertest (server), Jest + React Testing Library (client) |
| DevOps    | GitHub Actions, Prettier                           |

---

## Project Structure

```
/
├── server/          Express + MongoDB API
├── client/          React + Vite frontend
├── package.json     Root monorepo scripts
└── onboard.md       Contributor guide
```

### Server (`server/`)
- REST API at `/api/memories` (CRUD, auth-protected)
- Google OAuth at `/auth/google` → JWT cookie on callback
- Google Maps API key served at `GET /api/config`
- Models: `User` (Google profile), `Memory` (title, description, image, location, mood, dateCreated)

### Client (`client/src/`)
- `AuthContext` — fetches `/auth/me` on mount, stores current user
- `ProtectedRoute` — wraps all routes except `/login`
- Pages: `LoginPage`, `HomePage` (map + sidebar), `MemoriesPage` (grid + mood filter), `CreatePage` (create/edit)

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

# Server tests only
npm run test:server

# Client tests only
npm run test:client
```

---

## Deployment

| Service  | Target                        | Notes                                   |
| -------- | ----------------------------- | --------------------------------------- |
| Server   | Render or Railway             | Set env vars from `server/.env.example` |
| Client   | Vercel or Netlify             | Set `VITE_API_URL` to deployed server URL |
| Database | MongoDB Atlas                 |                                         |

---