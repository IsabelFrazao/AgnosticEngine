# Project Structure

Every folder and file explained.

---

## Top-level layout

```
agnostic-engine/
├── .github/               CI workflows (lint, typecheck, test)
├── apps/
│   └── renderer/          Next.js renderer app workspace (moved in M1)
├── packages/              Workspace shared-package scaffold (package extraction starts in later phases)
├── docs/                   This documentation (see `HARDENING-SESSION-REPORT.md` for phased hardening status)
├── .cursor/                AI agent rules and prompts
├── .husky/                 Git hooks
├── package.json            Workspace root scripts + tooling orchestration
└── CLAUDE.md               Instructions for Claude Code AI agent
```

Renderer app code/config now lives under `apps/renderer`. Root scripts (`npm run lint`, `npm test`, etc.) call renderer workspace scripts.

---

## `apps/renderer/` — Renderer app workspace

This workspace contains the full Next.js application and all app-level config files:

```
apps/renderer/
├── app/                  Next.js App Router pages and route handlers
├── src/                  Application source (engine, schemas, components, services)
├── public/               Static assets (SVGs, favicon)
├── .env.example          Renderer environment template
├── middleware.ts         Next.js middleware/proxy scaffold
├── next.config.ts        Next.js configuration + security headers
├── tsconfig.json         TypeScript configuration
├── eslint.config.mjs     ESLint rules
├── postcss.config.mjs    PostCSS (Tailwind v4)
├── vitest.config.ts      Vitest config (alias + runtime)
└── package.json          Renderer dependencies and scripts
```

---

## `apps/renderer/app/` — Pages and layout

This is the Next.js App Router entry point. Minimal by design — pages are thin schema consumers.

```
apps/renderer/app/
├── layout.tsx          Root HTML shell: fonts, QueryProvider, ThemeProvider, Sidebar, anti-flash script
├── page.tsx            Home page — loads "/" via `getHomePageEntry()` and passes components to MetadataEngine
├── [...slug]/
│   └── page.tsx        Catch-all dynamic route — resolves slug via `getPageEntry()`
├── globals.css         All CSS: theme tokens (CSS variables), Tailwind v4 setup, base styles
└── api/
    ├── __tests__/
    │   └── routes.test.ts  Contract tests: schemaVersion on happy paths, 404 for unknown page
    ├── layout/
    │   └── route.ts    GET /api/layout — returns shared layout schema
    ├── pages/
    │   └── route.ts    GET /api/pages  — returns pages manifest (no component arrays)
    └── page/
        └── [...slug]/
            └── route.ts  GET /api/page/:slug — returns full page entry; 404 if missing
```

**`apps/renderer/app/layout.tsx`** — Sets up the full app shell. Wraps children in `QueryProvider` (TanStack Query infrastructure) and `ThemeProvider`. Loads layout shell and permission-filtered `NavManifest` via `apps/renderer/src/lib/services`, registers app actions once via `apps/renderer/src/registry/registered-actions.ts`, and passes nav/extras to `Sidebar`. Anti-flash theme script runs before React hydrates.

**`apps/renderer/app/page.tsx`** — Home page (`/`). Loads the root page entry through the pages service. Intentionally thin — no business logic.

**`apps/renderer/app/[...slug]/page.tsx`** — Dynamic renderer for all non-root pages. Joins slug segments into a path (`["courses","modules"]` → `"/courses/modules"`), resolves the page via the pages service, renders via `MetadataEngine`. Returns 404 if not found.

**`apps/renderer/app/api/`** — Next.js Route Handlers that define the HTTP contract. Handlers delegate to the same `apps/renderer/src/lib/services` loaders as the App Router (mock-backed today). Point those services at a real backend when ready.

**`apps/renderer/app/globals.css`** — Contains the entire token system: 5 complete theme blocks (`:root`, `[data-theme="dark"]`, etc.), plus the Tailwind v4 `@theme` mapping that connects CSS vars to utility classes.

---

## `apps/renderer/src/` — Application source

```
apps/renderer/src/
├── engines/          The rendering engine
├── registry/         Component and action whitelists
├── schemas/          Zod validation schemas
├── components/       React UI components
├── lib/              Utilities, types, parsers, services
├── hooks/            Custom React hooks
├── utils/            Security and sanitization
├── data/             Mock and demo data
└── env.ts            Environment variable validation
```

---

### `apps/renderer/src/engines/`

The two files that make the engine work. Do not add business logic here.

| File | Purpose |
|------|---------|
| `MetadataEngine.tsx` | Top-level: iterates a schema array. No logic — delegates every item to `MetadataEngineItem`. |
| `MetadataEngineItem.tsx` | Per-node: validate → cycle/depth guard → permission → sanitize → lookup → render → recurse into children. |
| `__tests__/MetadataEngineItem.test.tsx` | Permission enforcement coverage |
| `__tests__/MetadataEngineItem.guards.test.tsx` | Depth and cycle guard coverage (mocks max depth in tests) |

---

### `apps/renderer/src/registry/`

The two whitelists that control what can and cannot happen.

| File | Purpose |
|------|---------|
| `component-registry.ts` | Maps `type` strings → React components (`COMPONENT_MAP`). TypeScript ensures completeness. |
| `action-registry.ts` | Maps `actionId` strings → event handlers (`ActionRegistry`). A singleton class. |
| `registered-actions.ts` | Single bootstrap point for action handler registration (imported once in `apps/renderer/app/layout.tsx`). |
| `__tests__/` | Registry contract tests (`action-registry` behavior + bootstrap idempotence). |

---

### `apps/renderer/src/schemas/`

All Zod validation schemas. The discriminated union is built automatically — you never edit `root.schema.ts` directly.

```
schemas/
├── root.schema.ts        Recursive discriminated union — auto-built from ATOM_SCHEMAS
├── page.schema.ts        Page/layout schemas: PageNavItem, PageManifestEntry, PagesManifest, LayoutSchema, NavManifest
└── atoms/
    ├── index.ts          ATOM_SCHEMAS: single source of truth for all atom schemas
    ├── button.schema.ts  Schema for type: "button"
    ├── table.schema.ts   Schema for type: "table"
    └── theme-switcher.schema.ts  Schema for type: "theme-switcher"
```

**Adding a new atom:** create a new `{type}.schema.ts` file and add it to `atoms/index.ts`. `root.schema.ts` updates automatically.

**`page.schema.ts`** — Defines the two-level schema structure: `Layout` (shared shell) and `PagesManifest` (content + nav). `NavManifest` is a slim view of `PagesManifest` without component arrays, used to cross the RSC → client boundary safely.

---

### `apps/renderer/src/components/`

All React components. Three sub-levels: atoms, organisms, and providers.

```
components/
├── atoms/
│   ├── Button.tsx          Renders a <button>; resolves click from ActionRegistry
│   ├── ThemeSwitcher.tsx   Theme picker group of toggle buttons
│   ├── DegradedStateUI.tsx "Component unavailable" fallback for failures
│   ├── Skeleton.tsx        Animated grey placeholder for loading states
│   └── FormattedUtc.tsx    Formats a UTC ISO string for the user's local timezone
├── organisms/
│   ├── Table.tsx           HTML table rendered from columns + rows metadata
│   └── Sidebar.tsx         Nav sidebar — derives menu items from NavManifest (Law of Derivation)
└── providers/
    └── QueryProvider.tsx   TanStack Query QueryClientProvider wrapper ('use client')
```

---

### `apps/renderer/src/lib/`

Pure logic, types, and services. No JSX. Grouped by concern.

```
lib/
├── metadata-types.ts       MetadataSchemaItem and MetadataComponentProps type aliases
├── api.ts                  Axios instance with base URL + 401 interceptor
├── logger.ts               Structured logger with pluggable transports (`setLoggerTransports`) and external reporter hook support
├── permissions.ts          Pure permission evaluator for metadata node access checks
├── http-security-headers.ts  CSP and baseline response security headers for `next.config`
├── site-config.ts          SITE_CONFIG: site name and description (white-label entry point)
├── resolve-action.ts       Centralised ActionRegistry resolution — resolves actionId, handles missing handler (warn + forceDisabled). Use in every interactive component instead of inlining the logic.
├── services/               Typed loaders for pages, layout, and session permissions (mock-backed; swap for API/DB)
│   ├── pages.ts            Validated pages manifest, nav slice, static params helpers
│   ├── layout.ts           Validated shared layout document
│   ├── current-user.ts     Effective permission list (demo stub)
│   └── __tests__/          Service contract tests
├── metadata/               Per-component metadata parsers
│   ├── migrate-layout.ts   Normalizes and validates layout schemaVersion
│   ├── migrate-page-manifest-entry.ts  Normalizes and validates page schemaVersion
│   ├── schema-version.ts   Supported schema versions and validation helpers
│   ├── engine-limits.ts    Max metadata tree depth + ancestor path helpers for cycle checks
│   ├── parse-button-metadata.ts
│   ├── parse-table-metadata.ts
│   └── parse-theme-switcher-metadata.ts
├── theme/                  Theme system
│   ├── theme-types.ts      ThemeId type and Theme interface
│   ├── themes.ts           THEMES array, THEME_IDS set, DEFAULT_THEME_ID
│   ├── theme-context.tsx   ThemeProvider, useThemeContext, localStorage read/write
│   └── theme-icons.tsx     SVG icon components (System, Light, Dark, Ocean, Forest)
└── datetime/
    └── utc-display.ts      parseUtcIso() and formatUtcLongLocal() using date-fns
```

---

### `apps/renderer/src/hooks/`

Custom React hooks. One concern per hook. No JSX.

| File | What it does |
|------|-------------|
| `useTheme.ts` | Re-exports `useThemeContext` as `useTheme` — the public API for theme state |
| `useClientReady.ts` | Returns `false` on server / first hydration paint, `true` after. Prevents SSR mismatches for browser-only state (theme, locale). |

---

### `apps/renderer/src/utils/`

Security implementation.

| File | What it does |
|------|-------------|
| `sanitize.ts` | Public entry point — re-exports `sanitizeMetadata` from `security.ts` |
| `security.ts` | Implementation: recursively strips HTML from string values, allows only `<b>`, `<i>`, `<strong>` (no attributes) |

---

### `apps/renderer/src/data/`

Static mock and demo data. Only used during development and demo scenarios.

| File | What it does |
|------|-------------|
| `mock-data.ts` | Exports `MOCK_LAYOUT` and `MOCK_PAGES` — the full schema in the new two-level structure. Replaces the old `mock-schema.json` + `mock-schema.ts`. |
| `mock-auth.ts` | Demo-only current user permissions used by the engine to enforce node-level access rules. |

---

### `apps/renderer/src/env.ts`

Validates environment variables at startup using Zod. Exports the `env` object — always import from here, never from `process.env` directly.

---

## `.cursor/` — AI agent rules

Rules that Cursor AI and other agents always apply when working in this repo.

| File | What it enforces |
|------|-----------------|
| `rules/agnostic-laws.mdc` | The Three Laws: Discovery, Purity, Validation, and folder layout |
| `rules/law-of-derivation.mdc` | Law of Derivation: pages map as single source of truth for content + nav; sub-menu derivation; extras escape hatch |
| `rules/agnostic-standards.mdc` | Senior coding standards: TanStack Query, date-fns, ARIA, API client, i18n, Tailwind v4 CSS variable syntax (`(--xxx)`), React type-only imports |
| `rules/security.mdc` | Zero-trust rendering, schema-first, action decoupling, error observability |
| `rules/solid-atomic-reuse.mdc` | SOLID principles, atomic layout, no duplication, generic components |
| `rules/metadata-tree.mdc` | The recursive engine pipeline in concise form |
| `rules/docs-maintenance.mdc` | Agents must update `docs/` when making structural changes |
| `prompts/review-logic.md` | Senior review prompt: checks for logic leakage, prop resilience, SOLID, Tailwind v4, security |

---

## Stack versions

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.2.4 | Framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling (CSS variables + utilities) |
| Zod | ^4.3.6 | Schema validation |
| Axios | ^1.14.0 | HTTP client |
| TanStack Query | ^5.96.1 | Data fetching and caching (QueryProvider wired; hooks ready for use) |
| date-fns | ^4.1.0 | Date formatting |
| react-error-boundary | ^6.1.1 | Component error isolation |
| Husky | ^9.1.7 | Git hooks |
| lint-staged | ^16.4.0 | Run linting/tests only on staged files |
| Vitest | ^4.1.5 | Unit and integration test runner |
| jsdom | ^27.0.1 | Browser-like environment for frontend tests |
