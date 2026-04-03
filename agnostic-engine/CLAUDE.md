# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Mandatory engineering standards

Treat the following project rules as **non-optional** for any code or config you add or change (same bar as Cursor’s always-on rules). They apply to components, hooks, `src/lib/` utilities, services, and parsers.

@.cursor/rules/agnostic-standards.mdc

@.cursor/rules/solid-atomic-reuse.mdc

@.cursor/rules/security.mdc

@.cursor/prompts/review-logic.md

**Other tools:** Cursor reads `.cursor/rules/` automatically. Claude Code reads this file and `@`-referenced files. **v0 MCP and other external agents do not automatically load these files**—paste a short checklist or point them at this section when you use them, then normalize output in-repo with Claude Code or Cursor.

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

UI is defined as a schema (array of `MetadataSchemaItem`) and rendered by `MetadataEngine`. The schema and component registries are the two canonical sources of truth — adding a new atom means registering in both. See **Agnostic Laws** below.

```
Schema (JSON)
  └─ MetadataEngine              # src/engines/MetadataEngine.tsx
       └─ MetadataEngineItem     # src/engines/MetadataEngineItem.tsx
            ├─ MetadataNodeSchema.safeParse()   # src/schemas/root.schema.ts
            ├─ sanitizeMetadata()               # src/utils/sanitize.ts
            ├─ COMPONENT_MAP[type]              # src/registry/component-registry.ts
            ├─ ErrorBoundary + Suspense
            └─ <DegradedStateUI> on failure
```

### Key Files

- `src/lib/metadata-types.ts` — `MetadataSchemaItem` and `MetadataComponentProps` types
- `src/schemas/atoms/index.ts` — **ATOM_SCHEMAS**: single source of truth for all atom schemas
- `src/schemas/root.schema.ts` — recursive discriminated union (auto-built from ATOM_SCHEMAS)
- `src/registry/component-registry.ts` — **COMPONENT_MAP**: type string → React component
- `src/registry/action-registry.ts` — action whitelist for button events (`ActionRegistry`)
- `src/engines/MetadataEngine.tsx` — top-level renderer (iterate only)
- `src/engines/MetadataEngineItem.tsx` — validate → sanitize → lookup → render
- `src/components/atoms/` — Skeleton, Button, DegradedStateUI, FormattedUtc, ThemeSwitcher
- `src/components/organisms/` — Table (lazy-loaded)
- `src/lib/api.ts` — Axios instance with interceptors; import this for all API calls
- `src/env.ts` — Zod-validated environment variables; use `env.NEXT_PUBLIC_API_URL` instead of `process.env` directly

### Conventions

- **All components** accept `metadata: Record<string, unknown>` and `requiredPermissions?: string[]` (RBAC slot — not yet enforced, but the prop must be threaded through)
- **Dates**: API always returns UTC ISO strings; format for display using `FormattedUtc` or `date-fns`
- **Environment**: New env vars must be added to `src/env.ts` Zod schema and `.env.example`
- **Lazy loading**: Organisms use `dynamic()` in `component-registry.ts`; atoms are static imports
- **Path alias**: `@/` resolves to the repo root (e.g., `@/src/components/...`)

### Stack

Next.js 16.2.2 · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query v5 · Axios · Zod v4 · date-fns v4 · react-error-boundary

## Agnostic Laws

These are non-negotiable. Also enforced via `.cursor/rules/agnostic-laws.mdc` (and the rest of `.cursor/rules/`).

### Law of Discovery
Whenever a new Atom is created, **all four steps are mandatory**:
1. Create `src/schemas/atoms/{type}.schema.ts` — `{type}MetadataSchema` (inner props) + `{type}AtomNodeBaseSchema` (full node)
2. Register in `src/schemas/atoms/index.ts` → `ATOM_SCHEMAS`
3. Register in `src/registry/component-registry.ts` → `COMPONENT_MAP`
4. Create `src/lib/metadata/parse-{type}-metadata.ts` — exports `{Type}Metadata` type and `parse{Type}Metadata(raw)` function

`root.schema.ts` and `MetadataEngine` rebuild automatically. No other file changes.

### Law of Purity
Components are Logic-Blind. All interactive events dispatch an `actionId` string to `ActionRegistry`. No direct function imports. No `eval()` or `new Function()` in metadata.

### Law of Validation
No metadata reaches a component without passing through:
`MetadataNodeSchema.safeParse()` → `sanitizeMetadata()` → render  
On failure: `logger.error()` + `<DegradedStateUI>`. No white screens. No silent catches.

## Security Protocol

### Schema Validation (Zod)
`MetadataNodeSchema.safeParse()` in `MetadataEngineItem` validates every item against the discriminated union of all registered atom schemas. Unknown `type` values never reach a component.

### Content Sanitization
`sanitizeMetadata()` (`src/utils/sanitize.ts`) recursively strips all HTML from string values except bare `<b>`, `<i>`, `<strong>` — attributes removed even on allowed tags. SSR-safe, no DOM dependency.

### ActionRegistry
Button `actionId` values must be pre-registered in `src/registry/action-registry.ts`. An unregistered `actionId` degrades the button to disabled and logs a warning.

### Logger
`src/lib/logger.ts` exports a `logger` singleton (console-backed). To integrate Sentry: replace the `consoleLogger` implementation — no call sites change.
