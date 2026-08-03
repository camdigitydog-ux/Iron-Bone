# Iron Bone Fitness and Nutrition

A Progressive Web App that unifies workout, nutrition, and running planning into one dashboard and calendar — built local-first, with optional accounts for syncing data across devices.

Live at **[fitness-planner.vercel.app](https://fitness-planner.vercel.app)**.

## What it does

- **Workouts** — build reusable templates or generate a session on the fly (strength, hypertrophy, powerlifting, bodybuilding styles), log sets/reps/weight, browse the exercise library, or build a custom session by muscle group.
- **Nutrition** — log meals against a food library (with an external search fallback), track macros against daily goals, and view calorie history over time.
- **Running** — log runs, generate a race-specific training plan (with a fueling guide), and see the current week's plan on the dashboard.
- **Planner** — a calendar merging planned and completed items across all three domains, so "planned but not done" has a home.
- **Dashboard** — today's workout, nutrition-vs-goal, and this week's run all in one place.
- **Accounts (optional)** — signing in is never required; the app is fully usable anonymously with local-only data. Signing in additionally syncs your whole local database to the server (pulled on login, pushed a few seconds after each change), so your data follows you across devices.
- **Installable** — a full PWA with an offline-capable service worker; install it to your home screen on mobile or desktop.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack in dev) |
| Styling | Tailwind CSS 4 |
| Local persistence | Dexie.js (IndexedDB) — the app works fully offline/local-only |
| Data layer | TanStack Query wrapping a repository interface; Zustand for ephemeral UI state only |
| Auth | Server Actions, scrypt password hashing, httpOnly session cookies |
| Server data | A swappable `DbDriver` — Postgres (`pg`) in production, SQLite (`node:sqlite`) for local dev, selected automatically by which env vars are present |
| PWA | Serwist (service worker) + Next's native `manifest.ts` |
| Forms | react-hook-form + zod |
| Charts | Recharts |

## Getting started

Requires Node ≥ 22.5 (for the built-in `node:sqlite` module).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no database env vars set, the app automatically uses a local SQLite file at `data/iron-bone.db` for accounts and sync — no setup required for local development. All non-account data (workouts, meals, runs, etc.) lives in the browser's IndexedDB regardless.

To point at a real Postgres database instead (as production does), set any one of:

```
POSTGRES_URL=...
POSTGRES_URL_NON_POOLING=...
DATABASE_URL=...
DATABASE_URL_UNPOOLED=...
PRISMA_DATABASE_URL=...
```

## Scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build (forced to webpack — Serwist doesn't support Turbopack builds yet)
npm run start    # run the production build
npm run lint     # eslint
```

## Project structure

```
src/
├── app/
│   ├── (app)/            # authenticated-optional route group: workouts, nutrition, running, planner, dashboard
│   ├── login/, signup/   # auth pages
│   ├── api/food-search/  # external food-search fallback
│   └── manifest.ts, sw.ts, ~offline/  # PWA plumbing
├── components/{ui,layout}/   # shared UI primitives and app shell (sidebar/bottom nav)
├── features/{workouts,nutrition,running,planner,dashboard}/  # per-domain components, hooks, generators
└── lib/
    ├── domain/            # plain TypeScript types for every entity
    ├── db/                # Dexie schema, seed data, and the local DB → JSON sync helpers
    ├── repositories/      # repository interfaces + Dexie implementations — the backend-swap seam
    ├── server/            # session handling, DbDriver interface + Postgres/SQLite implementations
    ├── sync/               # server actions for pulling/pushing a user's synced data blob
    └── providers/          # React context providers (repositories, query client, sync)
```

## How sync works

Every domain's data lives in a Dexie (IndexedDB) database in the browser — this is the only data store for anonymous users. When a user is signed in, `SyncProvider` pulls their last-synced snapshot on load (overwriting local data if a remote copy exists) and pushes a fresh snapshot a few seconds after any mutation succeeds, keyed off TanStack Query's shared mutation cache. The snapshot is just the whole Dexie database serialized to JSON, stored as one row per user in a `user_data` table.

## Deployment

Deployed on Vercel with GitHub integration — pushes to `main` auto-deploy. Vercel's Postgres is attached via `PRISMA_DATABASE_URL`/`POSTGRES_URL`, so production always uses the Postgres driver; local dev falls back to SQLite automatically.
