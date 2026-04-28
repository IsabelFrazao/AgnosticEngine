# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Mandatory engineering standards

Treat the following project rules as **non-optional** for any code or config you add or change (same bar as Cursor’s always-on rules). They apply to components, hooks, `src/lib/` utilities, services, and parsers.

@.cursor/rules/agnostic-laws.mdc

@.cursor/rules/agnostic-standards.mdc

@.cursor/rules/solid-atomic-reuse.mdc

@.cursor/rules/atomic-component-placement.mdc

@.cursor/rules/security.mdc

@.cursor/rules/law-of-derivation.mdc

@.cursor/rules/metadata-tree.mdc

@.cursor/rules/docs-maintenance.mdc

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
- **Atomic placement**: New UI components must live in `components/atoms/` or `components/organisms/` (no flat `components/*.tsx` additions)
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

### Law of Derivation
The `pages` map is the **only** source of truth for page content AND sidebar navigation. Also enforced via `.cursor/rules/law-of-derivation.mdc`.
1. A page entry with `nav` automatically appears in the sidebar — no other step.
2. A page entry with `nav.parent` is automatically nested under its parent — parent page is not touched.
3. Never declare sidebar items separately from pages. The sidebar derives itself from the `pages` map.
4. `layout.sidebar.extras` is the only exception: non-page items (external links, dividers). Use sparingly.
5. `nav.order` is a JavaScript sort key applied before DOM render — not a CSS property. No accessibility concern.

## Security Protocol

### Schema Validation (Zod)
`MetadataNodeSchema.safeParse()` in `MetadataEngineItem` validates every item against the discriminated union of all registered atom schemas. Unknown `type` values never reach a component.

### Content Sanitization
`sanitizeMetadata()` (`src/utils/sanitize.ts`) recursively strips all HTML from string values except bare `<b>`, `<i>`, `<strong>` — attributes removed even on allowed tags. SSR-safe, no DOM dependency.

### ActionRegistry
Button `actionId` values must be pre-registered in `src/registry/action-registry.ts`. An unregistered `actionId` degrades the button to disabled and logs a warning.

### Logger
`src/lib/logger.ts` exports a `logger` singleton (console-backed). To integrate Sentry: replace the `consoleLogger` implementation — no call sites change.

## Documentation Maintenance

The `docs/` folder is the canonical reference for this project. **Any task that makes a structural change must update the relevant `docs/` file in the same task.** Do not leave documentation stale.

### When to update docs

| Change | File to update |
|--------|---------------|
| New atom or organism created | `docs/04-components.md`, `docs/08-project-structure.md` |
| Component modified (props, behavior) | `docs/04-components.md` |
| New package installed or removed | `docs/08-project-structure.md` (stack table), `docs/02-getting-started.md` if it affects setup |
| Engine pipeline changed | `docs/03-how-it-works.md` |
| New or changed schema field | `docs/03-how-it-works.md`, `docs/04-components.md` |
| New theme or theme system change | `docs/06-theming.md` |
| Security model changed | `docs/07-security.md` |
| New environment variable | `docs/02-getting-started.md` |
| New Cursor rule or CLAUDE.md section | `docs/08-project-structure.md` |
| New folder or significant file added | `docs/08-project-structure.md` |
| A TODO resolved | `docs/TODOS.md` (remove or mark resolved) |
| New gap or incomplete feature identified | `docs/TODOS.md` (add with severity) |

### What "update" means
- Keep descriptions accurate — if behavior changed, rewrite the description
- Keep schema/props tables in sync with actual code
- Remove entries for things that no longer exist
- Do not add speculative future content — document what exists today

The full docs are in `docs/`. The rule is also enforced in `.cursor/rules/docs-maintenance.mdc`.
