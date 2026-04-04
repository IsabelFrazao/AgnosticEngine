# Project Structure

Every folder and file explained.

---

## Top-level layout

```
agnostic-engine/
├── app/                    Next.js App Router pages and layouts
├── src/                    All application source code
├── docs/                   This documentation
├── public/                 Static assets (SVGs, favicon)
├── .cursor/                AI agent rules and prompts
├── .husky/                 Git hooks
├── .env.example            Environment variable template
├── .env.local              Your local config (not committed)
├── next.config.ts          Next.js configuration
├── tsconfig.json           TypeScript configuration
├── eslint.config.mjs       ESLint rules
├── postcss.config.mjs      PostCSS (for Tailwind v4)
├── package.json            Dependencies and scripts
└── CLAUDE.md               Instructions for Claude Code AI agent
```

---

## `app/` — Pages and layout

This is the Next.js App Router entry point. Minimal by design — pages are thin schema consumers.

```
app/
├── layout.tsx    Root HTML shell: fonts, ThemeProvider, anti-flash script, SEO metadata
├── page.tsx      Home page — imports mock schema and passes it to MetadataEngine
└── globals.css   All CSS: theme tokens (CSS variables), Tailwind v4 setup, base styles
```

**`app/layout.tsx`** — Sets up the page shell. Loads Google fonts (Geist), wraps children in `ThemeProvider`, and injects the anti-flash theme script via `<Script strategy="beforeInteractive">` before React hydrates.

**`app/page.tsx`** — The only real page. Renders `MetadataEngine` with `mockSchema` as input. This is intentionally thin — the page should never contain business logic.

**`app/globals.css`** — Contains the entire token system: 5 complete theme blocks (`:root`, `[data-theme="dark"]`, etc.), plus the Tailwind v4 `@theme` mapping that connects CSS vars to utility classes.

---

## `src/` — Application source

```
src/
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

### `src/engines/`

The two files that make the engine work. Do not add business logic here.

| File | Purpose |
|------|---------|
| `MetadataEngine.tsx` | Top-level: iterates a schema array. No logic — delegates every item to `MetadataEngineItem`. |
| `MetadataEngineItem.tsx` | Per-node: validate → sanitize → lookup → render → recurse into children. |

---

### `src/registry/`

The two whitelists that control what can and cannot happen.

| File | Purpose |
|------|---------|
| `component-registry.ts` | Maps `type` strings → React components (`COMPONENT_MAP`). TypeScript ensures completeness. |
| `action-registry.ts` | Maps `actionId` strings → event handlers (`ActionRegistry`). A singleton class. |

---

### `src/schemas/`

All Zod validation schemas. The discriminated union is built automatically — you never edit `root.schema.ts` directly.

```
schemas/
├── root.schema.ts        Recursive discriminated union — auto-built from ATOM_SCHEMAS
└── atoms/
    ├── index.ts          ATOM_SCHEMAS: single source of truth for all atom schemas
    ├── button.schema.ts  Schema for type: "button"
    ├── table.schema.ts   Schema for type: "table"
    └── theme-switcher.schema.ts  Schema for type: "theme-switcher"
```

**Adding a new atom:** create a new `{type}.schema.ts` file and add it to `atoms/index.ts`. `root.schema.ts` updates automatically.

---

### `src/components/`

All React components. Two sub-levels: atoms (small, static) and organisms (larger, lazy-loaded).

```
components/
├── atoms/
│   ├── Button.tsx          Renders a <button>; resolves click from ActionRegistry
│   ├── ThemeSwitcher.tsx   Theme picker group of toggle buttons
│   ├── DegradedStateUI.tsx "Component unavailable" fallback for failures
│   ├── Skeleton.tsx        Animated grey placeholder for loading states
│   └── FormattedUtc.tsx    Formats a UTC ISO string for the user's local timezone
└── organisms/
    └── Table.tsx           HTML table rendered from columns + rows metadata
```

---

### `src/lib/`

Pure logic, types, and services. No JSX. Grouped by concern.

```
lib/
├── metadata-types.ts       MetadataSchemaItem and MetadataComponentProps type aliases
├── api.ts                  Axios instance with base URL + 401 interceptor
├── logger.ts               AppLogger interface + console implementation (swap for Sentry)
├── site-config.ts          SITE_CONFIG: site name and description (white-label entry point)
├── metadata/               Per-component metadata parsers
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

### `src/hooks/`

Custom React hooks. One concern per hook. No JSX.

| File | What it does |
|------|-------------|
| `useTheme.ts` | Re-exports `useThemeContext` as `useTheme` — the public API for theme state |
| `useClientReady.ts` | Returns `false` on server / first hydration paint, `true` after. Prevents SSR mismatches for browser-only state (theme, locale). |

---

### `src/utils/`

Security implementation.

| File | What it does |
|------|-------------|
| `sanitize.ts` | Public entry point — re-exports `sanitizeMetadata` from `security.ts` |
| `security.ts` | Implementation: recursively strips HTML from string values, allows only `<b>`, `<i>`, `<strong>` (no attributes) |

---

### `src/data/`

Static mock and demo data. Only used during development and demo scenarios.

| File | What it does |
|------|-------------|
| `mock-schema.json` | JSON schema used by the live demo page (`app/page.tsx`) |
| `mock-schema.ts` | Imports and types `mock-schema.json`; exports `mockSchema` and `DEMO_UPDATED_AT` for the page |
| `mock-actions.ts` | Side-effect module — registers 5 mock `ActionRegistry` handlers for all demo buttons. Imported by `mock-schema.ts` so handlers are always available when the mock schema is used. |

---

### `src/env.ts`

Validates environment variables at startup using Zod. Exports the `env` object — always import from here, never from `process.env` directly.

---

## `.cursor/` — AI agent rules

Rules that Cursor AI and other agents always apply when working in this repo.

| File | What it enforces |
|------|-----------------|
| `rules/agnostic-laws.mdc` | The Three Laws: Discovery, Purity, Validation, and folder layout |
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
| Next.js | 16.2.2 | Framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling (CSS variables + utilities) |
| Zod | ^4.3.6 | Schema validation |
| Axios | ^1.14.0 | HTTP client |
| TanStack Query | ^5.96.1 | Data fetching and caching (not yet used) |
| date-fns | ^4.1.0 | Date formatting |
| react-error-boundary | ^6.1.1 | Component error isolation |
| Husky | ^9.1.7 | Git hooks |
| lint-staged | ^16.4.0 | Run linting/tests only on staged files |
