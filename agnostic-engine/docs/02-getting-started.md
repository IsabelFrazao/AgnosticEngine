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

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Set up environment variables

The project requires one environment variable. Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

This points the HTTP client at the local dev server. It is validated at startup by Zod — the app will refuse to start if this value is missing or not a valid URL.

> **Note:** There is no real API yet. The app currently uses static mock data. This variable is required by the schema validation even so. See [TODOS.md](./TODOS.md) for context.

---

## 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the demo page rendering buttons, a table, and a theme switcher.

---

## Available commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the local development server with hot reload |
| `npm run build` | Create a production-optimised build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | Run ESLint across all TypeScript/JavaScript files |
| `npm test` | Run the full Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode during development |

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

This is configured in `tsconfig.json` under `paths`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App crashes on startup with "Invalid environment variables" | Create `.env.local` with a valid `NEXT_PUBLIC_API_URL` |
| `npm test` fails with "No test files found" | Add at least one `*.test.ts`/`*.test.tsx` file under `src/` |
| Pre-commit hook fails | Run `npm run lint` manually, fix the errors, re-stage |
| Port 3000 already in use | Next.js will try 3001, 3002, etc. automatically |
