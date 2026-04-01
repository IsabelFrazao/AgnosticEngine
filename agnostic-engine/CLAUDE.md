# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint
npm test           # Run tests via vitest (also runs on pre-commit via Husky)
```

Tests: `vitest run --related --passWithNoTests` is used for staged files. There is no dedicated test script in package.json yet — add vitest as a dev dependency before writing tests.

## Architecture

This is a **metadata-driven rendering engine** built on Next.js 16 (App Router) + React 19.

### Core Pattern

UI is defined as a schema (array of `MetadataSchemaItem`) and rendered by `MetadataEngine`, which maps `type` → component from `COMPONENT_MAP`. Components never hardcode their data — they always receive a `metadata` prop. Adding a new component means: create the component, add it to `COMPONENT_MAP` in `MetadataEngine.tsx`.

```
Schema (JSON)
  └─ MetadataEngine          # src/components/MetadataEngine.tsx
       ├─ ErrorBoundary       # wraps each item
       ├─ Suspense            # fallback: <Skeleton>
       └─ COMPONENT_MAP[type] # button → Button, table → Table (lazy)
```

### Key Files

- `src/lib/metadata-types.ts` — `MetadataSchemaItem` and `MetadataComponentProps` types
- `src/components/MetadataEngine.tsx` — orchestrator; register new components here
- `src/components/atoms/` — Skeleton, Button, FormattedUtc (primitive components)
- `src/components/organisms/` — Table (lazy-loaded via `lazy()`)
- `src/lib/api.ts` — Axios instance with interceptors; import this for all API calls
- `src/env.ts` — Zod-validated environment variables; use `env.NEXT_PUBLIC_API_URL` instead of `process.env` directly

### Conventions

- **All components** accept `metadata: Record<string, unknown>` and `requiredPermissions?: string[]` (RBAC slot — not yet enforced, but the prop must be threaded through)
- **Dates**: API always returns UTC ISO strings; format for display using `FormattedUtc` or `date-fns`
- **Environment**: New env vars must be added to `src/env.ts` Zod schema and `.env.example`
- **Lazy loading**: Organisms should be imported with `lazy()` in MetadataEngine; atoms can be static imports
- **Path alias**: `@/` resolves to the repo root (e.g., `@/src/components/...`)

### Stack

Next.js 16.2.2 · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query v5 · Axios · Zod v4 · date-fns v4 · react-error-boundary
