# Getting Started

## Prerequisites

You need the following installed on your machine:

| Tool | Version | Check with |
|------|---------|------------|
| Node.js | 18 or higher | `node --version` |
| npm | 9 or higher | `npm --version` |
| Git | Any recent | `git --version` |

---

## 1. Clone the repository

```bash
git clone <repository-url>
cd agnostic-engine
```

This repository uses npm workspaces (`apps/*`, `packages/*`). The active renderer Next.js app now lives in `apps/renderer`, while root scripts delegate to that workspace.
Shared schema/version contracts are owned by `packages/metadata-schema`.

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Set up environment variables

The project requires one environment variable and supports optional observability variables. Copy the renderer example file and fill it in:

```bash
cp apps/renderer/.env.example apps/renderer/.env.local
```

Open `apps/renderer/.env.local` and set:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Optional (server-side observability sink):

```
AE_LOG_INGEST_URL=https://logs.example.com/ingest
AE_LOG_INGEST_TOKEN=<secret-token>
```

`NEXT_PUBLIC_API_URL` points the HTTP client at the local dev server. It is validated at startup by Zod — the app will refuse to start if this value is missing or not a valid URL.

If `AE_LOG_INGEST_URL` is set, the logger will also POST structured server-side log events to that endpoint (optionally authenticated with `AE_LOG_INGEST_TOKEN`).

> **Note:** There is no real backend DB adapter wired yet. Renderer reads and builder draft/publish flows currently use the transitional `@agnostic/data-access` filesystem site store. This variable remains required by schema validation. See [TODOS.md](./TODOS.md) for context.

---

## 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the demo page rendering buttons, a table, and a theme switcher.

To run the builder shell during M5:

```bash
npm run dev:builder
```

Open [http://localhost:3001](http://localhost:3001) and sign in on `/login` (scaffold auth flow).

In M6, publishing from builder updates the shared local site snapshot, so refreshing renderer (`http://localhost:3000`) reflects the new published content.

---

## Available commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the local development server with hot reload |
| `npm run dev:builder` | Start the builder workspace dev server on port 3001 |
| `npm run build` | Create a production-optimised build |
| `npm run build:builder` | Build the builder workspace |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run start:builder` | Serve the builder production build on port 3001 |
| `npm run lint` | Run ESLint across all TypeScript/JavaScript files |
| `npm run lint:builder` | Run ESLint for the builder workspace |
| `npm run typecheck:builder` | Run TypeScript checks for the builder workspace |
| `npm test` | Run the full Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode during development |

All commands above are run from the repository root and delegated to `apps/renderer`.

---

## Pre-commit hook

Husky runs automatically when you commit. It executes:

1. `eslint --fix` on staged files
2. `vitest run --related --passWithNoTests` on staged files

If ESLint finds unfixable errors, the commit is blocked. Fix the errors, re-stage, and commit again.

---

## TypeScript path alias

Throughout the codebase, `@/` resolves to the project root:

```ts
import { MetadataEngine } from '@/src/engines/MetadataEngine';
// same as: import { MetadataEngine } from '../../engines/MetadataEngine';
```

This is configured in `apps/renderer/tsconfig.json` under `paths`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App crashes on startup with "Invalid environment variables" | Create `apps/renderer/.env.local` with a valid `NEXT_PUBLIC_API_URL` and valid URL format for `AE_LOG_INGEST_URL` if set |
| `npm test` fails with "No test files found" | Add at least one `*.test.ts`/`*.test.tsx` file under `src/` |
| Pre-commit hook fails | Run `npm run lint` manually, fix the errors, re-stage |
| Port 3000 already in use | Next.js will try 3001, 3002, etc. automatically |
| Builder app redirects to `/login` unexpectedly | Ensure the builder auth cookie is set by signing in at `/login` in the builder app |
