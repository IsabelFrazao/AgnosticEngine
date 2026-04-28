# Hardening roadmap — session report & continuation guide

**Purpose:** Single place to resume work after a break. It summarizes the agreed **phase 0–1.6** hardening plan, what landed (with commits), where code lives, and sensible **next steps**.

**Repo note:** Git history is on the parent repository `AgnosticEngine`; paths below are under `agnostic-engine/` unless stated otherwise.

**Last updated:** 2026-04-23

---

## Original plan (condensed)

| Phase | Intent |
|-------|--------|
| **0.1** | Test baseline — Vitest, scripts, Husky aligned with `lint-staged` |
| **0.2** | CI — GitHub Actions: lint, typecheck, test |
| **0.3** | Logger — `logger.info` / no raw `console.*` in app actions |
| **1.1** | RBAC — enforce `node.permissions` in `MetadataEngineItem` |
| **1.2** | `schemaVersion` — layout + pages, migrations, API normalization |
| **1.3** | HTTP security — CSP + headers in `next.config`, `middleware` scaffold |
| **1.4** | Tree guards — max depth + cycle detection before permissions |
| **1.5** | Service boundary — no `MOCK_*` in App Router; `src/lib/services/*` |
| **1.6** | API contracts — Vitest smoke tests for `/api/*` (+ 404) |

---

## Commits (hardening series)

These are on `main` of **`D:/repos/AgnosticEngine`** (newest first):

| Commit | Phase | Summary |
|--------|--------|---------|
| `5e62c2f` | 1.6 | API contract tests — 404 for unknown page slug |
| `da5e550` | 1.5 | Data service boundary — services + API + app wired |
| `264011e` | 1.4 | Metadata tree guards — depth + cycle |
| `90216bb` | 1.3 | HTTP security baseline — headers + middleware scaffold |
| `3dca810` | 1.2 | Schema version contract — `1.0`, migrations, API |
| `f76b1f5` | 1.1 | Node-level permission enforcement |
| `1937528` | 0.3 | Logger standardization |
| `02fd3f9` | 0.2 | CI workflow `.github/workflows/ci.yml` |
| `91bcd00` | 0.1 | Vitest baseline, `vitest.config.ts` (path aliases), smoke test |

---

## What to run locally

From `agnostic-engine/`:

```bash
npm install
npm run lint
npx tsc --noEmit
npm test
npm run build   # includes audit + Next build; slower
```

---

## Architecture map (post-hardening)

### Engine pipeline (`MetadataEngineItem`)

Order after validation:

1. **Cycle guard** — `id` must not repeat on ancestor path → `DegradedStateUI` `cycle-detected`
2. **Depth guard** — `depth >= MAX_METADATA_TREE_DEPTH` (10) → `max-depth-exceeded`
3. **Permissions** — `evaluatePermissionAccess` → `insufficient-permissions`
4. **Sanitize** → **registry** → **render** → **recurse** (children get `depth + 1` and extended ancestor set)

**Children / grandchildren:** Supported recursively until depth or cycle stops the branch.

**Key files:**

- `src/engines/MetadataEngineItem.tsx`
- `src/engines/MetadataEngine.tsx` (passes `depth={0}`)
- `packages/engine-core/src/engine-limits.ts` — `MAX_METADATA_TREE_DEPTH`, ancestor helpers
- `src/components/atoms/DegradedStateUI.tsx` — reason union includes guard reasons

### Data & API

- **Services (single validated path for RSC + route handlers):**
- `apps/renderer/src/lib/services/pages.ts` — manifest, nav slice, `getPageEntry`, `getHomePageEntry`, `getStaticPathParams`, `getDemoUpdatedAt`
  - `apps/renderer/src/lib/services/layout.ts` — `getLayout()`
  - `apps/renderer/src/lib/services/current-user.ts` — `getCurrentUserPermissions()` (demo)

- **App Router** imports **services only** (not `mock-data`):
  - `apps/renderer/app/page.tsx`, `apps/renderer/app/[...slug]/page.tsx`, `apps/renderer/app/layout.tsx`

- **API:** `apps/renderer/app/api/*/route.ts` delegates to the same services.

- **Data-access seam (until DB adapter):** `packages/data-access` (`InMemoryPublishedContentRepository`), plus demo auth source `apps/renderer/src/data/mock-auth.ts`

### Schema version

- `schemaVersion: "1.0"` on layout + page entries
- Helpers: `packages/metadata-schema/src/schema-version.ts`, `packages/metadata-schema/src/migrations.ts`
- Zod contract builder: `packages/metadata-schema/src/page-schemas.ts` (consumed by renderer `src/schemas/page.schema.ts`)

### Component catalog parity

- Canonical component support and builder defaults are now defined in `packages/component-catalog/src/index.ts`.
- Renderer registry consumes catalog type keys.
- Builder palette/inspector surfaces are generated from the same catalog contract.

### Security transport

- `src/lib/http-security-headers.ts` — CSP + headers (dev allows `'unsafe-eval'` for Next)
- `next.config.ts` — `headers()`
- `middleware.ts` — pass-through scaffold for future auth / rate limits

### Observability

- `src/lib/logger.ts` — structured logger with transport pipeline (`console` + optional external reporter hook), plus `setLoggerTransports(...)` for provider wiring
- `src/registry/registered-actions.ts` — demo actions emit through centralized logger

### Tests

- `vitest.config.ts` — `@/` alias for Vitest
- Examples: `src/lib/__tests__/`, `src/lib/metadata/__tests__/`, `src/engines/__tests__/`, `app/api/__tests__/routes.test.ts`, `src/lib/services/__tests__/`

### CI

- `.github/workflows/ci.yml` — install, lint, `tsc --noEmit`, `npm test`

---

## Documentation touched

Canonical docs updated during this work include:

- `docs/02-getting-started.md` — test commands
- `docs/03-how-it-works.md` — pipeline, schema, data loading, contract tests pointer
- `docs/04-components.md` — `DegradedStateUI` reasons, RBAC note
- `docs/07-security.md` — layers (permissions, HTTP headers)
- `docs/08-project-structure.md` — tree, services, vitest, middleware, engines tests
- `docs/TODOS.md` — refreshed items (still read for honest gaps)

---

## Still open / strong next steps

Not done in this series (intentionally):

1. **Real auth / session** — replace `getCurrentUserPermissions()` and add **route-level** RBAC (pages/API), not only node-level.
2. **Database + publish model** — builder writes drafts; renderer reads published snapshots; avoid two apps writing the same tables without versioning.
3. **Monorepo** — `apps/*` + `packages/*` after stabilizing contracts (your earlier plan).
4. **Deeper tests** — theme/hydration hooks and broader integration/E2E (Playwright).
5. **CSP tuning** — when adding third-party scripts, analytics, or embeds.
6. **`apiClient` in services** — when the backend is real, server loaders may use internal DB helpers; browser may use `apiClient` per project rules.

Use **`docs/TODOS.md`** as the living gap list; align it when you close items.

---

## How to continue tomorrow (suggested order)

1. Pull latest `main` on `AgnosticEngine` and open **`agnostic-engine/`**.
2. Skim **`docs/TODOS.md`** and this file.
3. Pick one vertical:
   - **Auth:** session + `getCurrentUserPermissions` from real identity; optional `middleware` enforcement.
   - **Data:** replace mock inside **services only** (pages/layout) so App Router stays unchanged.
   - **Monorepo:** extract `packages/metadata-schema`, `packages/engine`, etc., only after auth/data direction is clear.

---

## Quick reference — rules you asked to honor

- **Law of Derivation** — sidebar/pages from manifest only; `layout.sidebar.extras` for non-page links.
- **Law of Purity** — components use `ActionRegistry`, not imported business handlers.
- **Law of Validation** — Zod + sanitize before render; failures → logger + degraded UI.
- **SOLID / reuse** — non-JSX logic in `src/lib/` (permissions, headers, engine limits, services).
- **Docs** — update `docs/` when behavior or structure changes (**docs-maintenance**).

---

## Continuation log — 2026-04-23

### Current status checkpoint

- Phase **0.1 -> 1.6** is complete and shipped (see commit table above).
- Remaining risk is now concentrated in **auth/session boundaries**, **test depth**, and **production observability**.
- App Router and API routes already share service-level loaders, which is the correct seam for replacing mocks with real data incrementally.

### Recommended next phases (senior/scalable order)

| Phase | Priority | Why now | Deliverable |
|-------|----------|---------|-------------|
| **1.7 Auth boundary hardening** | Critical | Closes largest production/security gap (`docs/TODOS.md` item 2) | Session-backed `getCurrentUserPermissions()` + route-level enforcement for pages and API |
| **1.8 Action registration bootstrap** | Critical | Prevents feature drift where buttons exist without executable handlers (item 3) | Central `registered-actions` bootstrap imported once at app startup |
| **1.9 Test depth expansion** | High | Reduces regression risk before data/auth complexity increases (item 5) | Focused unit suites for sanitizer/parsers/ActionRegistry + route auth cases |
| **2.0 Observability upgrade** | Medium | Makes degraded and error states visible in production (items 8/15) | Replace logger backend with Sentry/Datadog implementation |

### Architectural constraints to keep

1. **One permission source**: all UI/API checks derive from one session-auth provider abstraction (avoid per-route ad hoc checks).
2. **One data seam**: App Router and API must continue to consume `src/lib/services/*` only.
3. **One action bootstrap**: register actions from a single entrypoint to avoid duplicate/late registration.
4. **One migration path**: when `schemaVersion` moves to `2.0`, keep explicit `1.0 -> 2.0` migration helpers.

### Suggested first PR (small but high leverage)

Scope:

- Implement `src/lib/services/current-user.ts` against real auth/session provider (keep return contract stable).
- Add page-level and API-level authorization checks using that service contract.
- Add tests for allowed/denied route cases.
- Update `docs/07-security.md` and `docs/TODOS.md` in the same PR.

Exit criteria:

- Unauthorized users cannot access protected routes or API payloads.
- Existing node-level `MetadataEngineItem` permission checks remain intact (defense in depth).
- CI remains green (`lint`, `tsc --noEmit`, `npm test`).

---

### Phase 1.7 completion note

Shipped in this continuation:

- Session-aware permission resolution via `src/lib/services/current-user.ts` (header/cookie with demo fallback).
- Route-level page gating in `app/page.tsx` and `app/[...slug]/page.tsx`.
- API authorization in `app/api/page/[...slug]/route.ts` and permission-filtered nav payload in `app/api/pages/route.ts`.
- Added/updated tests in `app/api/__tests__/routes.test.ts` and `src/lib/services/__tests__/pages.test.ts`.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

### Phase 1.8 completion note

Shipped in this continuation:

- Added `src/registry/registered-actions.ts` as the single action bootstrap entrypoint.
- Moved action registration out of mock data side-effects and into app startup (`app/layout.tsx` import).
- Removed `src/data/mock-actions.ts` to avoid hidden registration coupling.
- Added bootstrap tests in `src/registry/__tests__/registered-actions.test.ts`.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

### Phase 1.9 completion note

Shipped in this continuation:

- Added sanitizer coverage in `src/utils/__tests__/sanitize.test.ts`.
- Added parser coverage in `src/lib/metadata/__tests__/parsers.test.ts`.
- Added registry behavior coverage in `src/registry/__tests__/action-registry.test.ts`.
- Updated TODO/docs to reflect improved coverage and remaining hook/integration gaps.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

### Phase 2.0 completion note

Shipped in this continuation:

- Replaced single console logger backend with a transport-based logger core in `src/lib/logger.ts`.
- Added structured `LogEntry` events (`level`, `message`, `context`, `timestamp`, `source`) for consistent ingestion.
- Added external reporter hook support (`globalThis.__AGNOSTIC_ENGINE_REPORTER__`) to wire Sentry/Datadog-style sinks without call-site changes.
- Added `setLoggerTransports(...)` to switch transports at bootstrap/environment boundaries.
- Added logger transport tests in `src/lib/__tests__/logger.test.ts`.
- Updated security/structure/TODO docs to reflect the new observability seam and remaining provider wiring work.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

### Phase 2.1 completion note

Shipped in this continuation:

- Added configurable server-side remote log forwarding via `AE_LOG_INGEST_URL` (+ optional `AE_LOG_INGEST_TOKEN`) in `src/lib/logger.ts`.
- Kept structured transport architecture while making production forwarding configurable without code changes.
- Updated environment schema and examples (`src/env.ts`, `.env.example`) and onboarding docs (`docs/02-getting-started.md`).
- Updated security/TODO docs to reflect current observability state and remaining provider-native adapter work.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

### Phase 2.2 completion note

Shipped in this continuation:

- Wired `FormattedUtc` into `src/components/organisms/Table.tsx` for ISO UTC cell values.
- Preserved plain-string rendering for non-date cell values.
- Added server-render test coverage in `src/components/organisms/__tests__/Table.test.tsx`.
- Updated component/TODO docs to mark the table date-formatting gap as resolved.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

### Phase 2.3 completion note

Shipped in this continuation:

- Hardened permission resolution in `src/lib/services/current-user.ts`:
  - header/cookie remain first-class inputs
  - demo fallback is now development-only
  - non-dev default is empty permissions (secure by default)
- Updated API contract tests to provide explicit permissions for protected page access and to verify omitted-permission behavior.
- Updated security/TODO docs to reflect secure defaults and remaining real session integration gap.

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

---

## Monorepo execution blueprint (for tomorrow)

### Why this architecture

You want two products with one shared domain:

1. **Renderer app** (current app): reads published metadata from DB and renders websites.
2. **Builder app** (new app): visual drag-and-drop editor (draw.io/Outsystems style UX) that writes drafts/published metadata to DB.

The clean architecture is:

- shared **domain contracts** (schemas, types, migration rules, permissions model)
- shared **engine/runtime primitives** (registry, sanitization, guards, action contracts)
- app-specific **composition/UI** and app-specific **delivery concerns** (RSC pages, editor canvas UX, auth UI, API endpoints)

This minimizes duplication, keeps contracts strict, and allows independent deployment of builder and renderer.

---

### Target monorepo structure (final desired state)

```text
AgnosticEngine/
├── apps/
│   ├── renderer/                  # current Next.js app (public site renderer)
│   └── builder/                   # new Next.js app (visual page builder)
├── packages/
│   ├── metadata-schema/           # Zod schemas + schemaVersion migrations + shared types
│   ├── component-catalog/         # canonical component definitions (type IDs, inspector fields, defaults)
│   ├── engine-core/               # validation/sanitize/permission/tree guards + shared engine helpers
│   ├── ui-kit/                    # shared atoms/organisms usable by both apps
│   ├── action-contracts/          # action IDs, payload contracts, registration helpers
│   ├── data-access/               # DB read/write repositories + publish workflow services
│   └── observability/             # logger transports and provider adapters
├── tooling/
│   ├── tsconfig/
│   ├── eslint/
│   └── vitest/
├── package.json                   # workspaces + root scripts
└── docs/
```

Notes:

- Start with `metadata-schema`, `engine-core`, and `data-access` first. They unlock both apps quickly.
- `ui-kit` should extract only truly shared components; do not over-extract builder-specific canvas UI.
- `component-catalog` is mandatory to prevent builder/renderer drift on supported components.

---

### Domain model for DB (single source of truth)

Use a **site + version + page** model with explicit publish boundaries.

Core entities:

- `sites`
  - `id`, `slug`, `name`, `owner_org_id`, timestamps
- `site_versions`
  - `id`, `site_id`, `version_number`, `status` (`draft` | `published` | `archived`), `created_by`, timestamps
  - immutable snapshot once published
- `pages`
  - `id`, `site_version_id`, `path`, `title`, `nav_json`, `permissions_json`, `header_json`, `components_json`, `schema_version`
  - unique(`site_version_id`, `path`)
- `layout_documents`
  - `id`, `site_version_id`, `layout_json`, `schema_version`
- `publish_events`
  - audit table for release history + rollback traceability

Rules:

- Builder writes to `draft` version only.
- Publish creates/promotes a version snapshot used by renderer.
- Renderer reads only `published` (or a preview token for explicit preview mode).
- No direct renderer writes to content tables.

---

### Builder app architecture (drag-and-drop)

Builder should have clear internal layers:

1. **Canvas state layer**
   - normalized node graph (`id`, `type`, parent, order, props)
   - undo/redo command stack
   - selection/inspector state
2. **Schema projection layer**
   - converts canvas graph <-> metadata JSON (`MetadataSchemaItem[]`)
   - validates using shared package schemas before save/publish
3. **Persistence layer**
   - save draft, load draft, publish, version history
   - all via `packages/data-access`
4. **Component palette + inspector**
   - generated from `packages/component-catalog` metadata (no hand-maintained duplicate lists)
   - no duplicated hand-coded field rules

Key principle: builder edits a graph for UX ergonomics, but saves canonical metadata contracts.

---

### Renderer app architecture in monorepo

Renderer remains thin:

- Route handlers call `data-access` repositories
- Repositories return validated contracts from `metadata-schema`
- Engine rendering uses shared `engine-core` rules
- App Router composition stays app-specific (`apps/renderer/app/*`)

This preserves hardening guarantees while swapping mock data for DB reads.

---

### Shared package boundaries (strict ownership)

`packages/metadata-schema`
- Owns: Zod page/layout/node schemas, schema versions, migration functions
- Must not import UI components

`packages/component-catalog`
- Owns: canonical component catalog (`type`, label, category, default metadata, inspector field config, capability flags)
- Shared by: builder palette/inspector and renderer registry wiring
- Must not import app routes, DB, or app-specific UI

`packages/engine-core`
- Owns: sanitize, permission evaluation, tree limits, registry contracts, parse helpers
- Must not import app routes or DB code

`packages/data-access`
- Owns: repositories + transactions + publish workflows
- Must not import React/UI

`packages/ui-kit`
- Owns: shared presentational components that are truly cross-app and must match visually between builder preview and renderer output
- Must not import DB/repository code

`packages/observability`
- Owns: logger interfaces, transports, adapters
- Must not import app UI

---

### Phased migration plan (separate PR-ready steps)

#### Phase M0 — Workspace foundation

Goal:
- Introduce npm workspaces and root-level scripts without moving app code yet.

Changes:
- root `package.json` with workspaces (`apps/*`, `packages/*`)
- keep current app runnable during transition
- baseline CI updated to workspace commands

Exit criteria:
- `npm run lint`, `npm test`, `npm run build` still pass from root
- no behavior change

---

#### Phase M1 — Move current app to `apps/renderer`

Goal:
- Relocate current Next app with zero behavior drift.

Changes:
- move app files into `apps/renderer`
- update tsconfig aliases, vitest aliases, eslint paths, CI paths
- keep docs and scripts accurate

Exit criteria:
- renderer app boots and tests pass in new location
- all existing hardening behavior preserved

---

#### Phase M2 — Extract `metadata-schema` package

Goal:
- centralize all schema/version contracts.

Changes:
- move shared schemas/migrations/types to `packages/metadata-schema`
- update renderer imports
- add package-level tests

Exit criteria:
- contract tests unchanged
- no duplicated schema code left in app

---

#### Phase M2.5 — Extract `component-catalog` package (component parity lock)

Goal:
- make component support and configuration a single source of truth for both apps.

Changes:
- add `packages/component-catalog` with entries per component type:
  - `type`
  - display label/category
  - default metadata factory
  - inspector field schema/config
  - capability flags (`supportsChildren`, etc.)
- renderer builds/derives its registry mapping from this catalog contract
- builder palette + inspector are generated from this catalog
- add parity test that fails when a component exists in renderer but is absent in catalog (or vice versa)

Exit criteria:
- no hand-maintained duplicate component lists in apps
- adding a component updates one canonical catalog + required shared contracts
- parity tests enforce builder/renderer sync

---

#### Phase M3 — Extract `engine-core` package

Goal:
- centralize engine safety rules and reusable metadata utilities.

Changes:
- move sanitization, permission evaluator, tree guards, metadata parsers, registry contracts
- renderer consumes package APIs

Exit criteria:
- `MetadataEngineItem` behavior unchanged
- security test coverage remains green

---

#### Phase M4 — Introduce `data-access` package + DB integration for renderer

Goal:
- replace mock-backed service layer with repository-backed reads.

Changes:
- define repository interfaces and SQL/ORM implementations
- renderer route handlers read published versions from DB
- keep API contracts stable

Exit criteria:
- renderer serves real DB content
- mock data path removed or isolated to local demo profile

---

#### Phase M5 — Scaffold `apps/builder` (MVP shell)

Goal:
- stand up builder app with auth, site selector, canvas shell.

Changes:
- Next app with protected routes
- basic canvas + palette + inspector shells
- load/save draft metadata through `data-access`

Exit criteria:
- can create/update a draft site version from UI

---

#### Phase M6 — Builder drag/drop + publish workflow

Goal:
- complete builder MVP for real usage.

Changes:
- drag/drop interactions
- undo/redo
- validation errors surfaced in UI
- publish flow creates published snapshot

Exit criteria:
- builder publish produces renderer-visible content without manual DB edits

---

#### Phase M7 — Shared `ui-kit` and clean dedup pass

Goal:
- extract only real cross-app UI primitives.

Changes:
- move reusable atoms/organisms/hooks
- keep app-specific UX in owning app

Exit criteria:
- no duplicated shared UI logic
- no over-coupling between builder and renderer

---

### Shared components strategy (non-negotiable)

To guarantee that builder output always matches renderer output:

1. **One canonical component catalog** (`packages/component-catalog`)
   - both apps consume it
   - no per-app component definition forks
2. **One metadata schema contract** (`packages/metadata-schema`)
   - parser/validation rules shared
3. **One rendering primitive set** (`packages/ui-kit`)
   - same visual components reused where applicable
4. **Parity CI checks**
   - fail build if catalog/renderer registry diverge
   - fail build if inspector field contracts drift from metadata schema

This allows rapid feature growth without “builder can create it but renderer cannot render it” regressions.

---

### PR slicing strategy (to stay reviewable)

- 1 PR per migration phase above.
- Keep each PR under ~500 effective changed lines when possible.
- For risky phases, split into:
  1) mechanical move PR
  2) behavioral change PR

Review checklist per PR:
- architecture boundary respected
- imports only from allowed package directions
- no schema drift
- component catalog parity preserved (builder/renderer)
- docs updated in same PR
- CI green

---

### Dependency direction rules (must not be broken)

- `apps/*` can import from `packages/*`
- `packages/ui-kit` can import from `packages/metadata-schema` only when needed for strict props contracts
- `packages/data-access` cannot import from `apps/*` or UI packages
- `packages/metadata-schema` cannot import from app/runtime code
- cyclic dependencies between packages are forbidden

Enforce with:
- TS project references
- ESLint import boundaries

---

### Auth and multi-tenant model (both apps)

- Add real session identity provider for both apps.
- Builder requires authenticated users with authoring roles.
- Renderer public routes may be anonymous, but protected page metadata still enforces permissions.
- Tenant scoping:
  - every site belongs to org/tenant
  - all reads/writes filtered by tenant at repository layer

---

### Publish model (critical consistency rules)

- Builder edits only draft version rows.
- Publish operation must be transactional:
  1) validate draft contracts
  2) create immutable published version snapshot
  3) mark previous published as superseded (optional strategy)
  4) record publish event
- Renderer serves latest published by default.
- Preview mode uses explicit draft/version token.

---

### Performance and scalability notes

- Cache published page/layout payloads by `site_id + version_id + path`.
- Invalidate cache on publish event only.
- Keep schema payload normalized but avoid over-joining at render path.
- Add pagination/search for builder asset/page lists early.

---

### Risks and mitigations

- **Risk:** package extraction causes hidden import cycles  
  **Mitigation:** enforce import boundary lint rules in M0/M1.

- **Risk:** builder graph diverges from renderer contracts  
  **Mitigation:** schema projection layer must validate with shared Zod before save.

- **Risk:** concurrent edits overwrite drafts  
  **Mitigation:** optimistic locking (`updated_at` or version counter) + conflict UX.

- **Risk:** publish introduces partial writes  
  **Mitigation:** single DB transaction with audit row.

---

### Tomorrow kickoff runbook (step-by-step)

1. Pull latest main.
2. Read this section fully (`Monorepo execution blueprint`).
3. Confirm package manager/workspace tool choice (default: npm workspaces).
4. Execute **Phase M0** only.
5. Run full gates:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm test`
   - `npm run build`
6. Update docs (`02`, `08`, `TODOS`, this file).
7. Commit Phase M0 as one isolated PR unit.
8. Stop and review before Phase M1.

---

### Definition of done before starting monorepo Phase M0

- Hardening phases up to 2.3 are complete and committed.
- Working tree is clean.
- This plan is accepted as baseline.
- We agree to execute phases sequentially with one commit/PR per phase.

---

### Quick glossary (shared language for implementation)

- **Renderer app:** public/consumer app that renders published metadata.
- **Builder app:** internal authoring app with drag/drop canvas.
- **Draft version:** editable site version not visible publicly.
- **Published version:** immutable snapshot served by renderer.
- **Schema contract:** Zod-validated shape shared by both apps.
- **Engine core:** shared safety/rendering primitives independent of app framework.

---

## Continuation log — 2026-04-28

### Phase M0 completion note

Shipped in this continuation:

- Added npm workspace foundation in root `package.json` with:
  - `workspaces: ["apps/*", "packages/*"]`
- Added minimal monorepo scaffolding directories:
  - `apps/.gitkeep`
  - `packages/.gitkeep`
- Kept current renderer app location unchanged (`app/`, `src/`, `public/`) per M0 scope.
- Kept CI quality checks unchanged (`lint`, `tsc --noEmit`, `npm test`) since root commands remain valid in this transitional state.
- Updated docs for M0 transitional accuracy (`02-getting-started`, `08-project-structure`, `TODOS`, and this report).

Validation run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- `npm run build`

Notes:

- Build remains green, with existing non-blocking audit warning output (`postcss` via `next` transitive dependency) and the existing Next.js middleware deprecation notice.
- Stop point honored: do not begin M1 app relocation until explicit review/approval.

---

### Phase M1 completion note

Shipped in this continuation:

- Moved the current Next.js renderer app from repo root into `apps/renderer` with no intended behavior drift.
- Relocated app/runtime/config files:
  - `app/`, `src/`, `public/`
  - `middleware.ts`, `next.config.ts`, `next-env.d.ts`
  - `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`
  - `.env.example` (to `apps/renderer/.env.example`)
- Added `apps/renderer/package.json` with renderer scripts and dependencies.
- Updated root `package.json` scripts to delegate to the renderer workspace (`npm run <script> -w agnostic-engine-renderer`).
- Updated root `lint-staged` to execute ESLint/Vitest via renderer workspace context.
- Updated CI typecheck command to use root workspace script (`npm run typecheck`).
- Updated docs (`02-getting-started`, `08-project-structure`, `TODOS`, and this report) for M1 paths and workflow.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Notes:

- Build remains green with the same existing advisory/deprecation output (`postcss` advisory via `next` transitive dependency; middleware-to-proxy notice).
- Local environment file now needs to be in renderer workspace context (`apps/renderer/.env.local`) for Next build/runtime variable loading.

---

### Phase M2 completion note

Shipped in this continuation:

- Added `packages/metadata-schema` and extracted shared schema/version contracts:
  - `src/schema-version.ts` (`CURRENT_SCHEMA_VERSION`, guards)
  - `src/page-schemas.ts` (shared page/layout schema factory)
  - `src/migrations.ts` (`migrateLayout`, `migratePageManifestEntry`)
  - package tests under `src/__tests__`
- Rewired renderer to consume `@agnostic/metadata-schema` in services and schema-version/migration tests.
- Kept renderer behavior stable by preserving local `apps/renderer/src/schemas/page.schema.ts` as a thin adapter that composes `MetadataNodeSchema` with shared page/layout contracts.
- Removed renderer-local duplicated schema-version/migration files:
  - `apps/renderer/src/lib/metadata/schema-version.ts`
  - `apps/renderer/src/lib/metadata/migrate-layout.ts`
  - `apps/renderer/src/lib/metadata/migrate-page-manifest-entry.ts`
- Updated workspace aliases (`apps/renderer/tsconfig.json`, `apps/renderer/vitest.config.ts`, `apps/builder/tsconfig.json`) for `@agnostic/metadata-schema`.
- Added live phase tracker file: `docs/PHASE-M2-PROGRESS.md`.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test` (includes package-level `packages/metadata-schema/src/__tests__/*`)
- `npm run build`
- `npm run lint:builder`
- `npm run typecheck:builder`
- `npm run build:builder`

Notes:

- Shared schema/version contracts are now centralized in `packages/metadata-schema`.
- Renderer-only atom/root schemas remain in `apps/renderer/src/schemas/*` and are planned for further cross-app parity work in Phase M2.5.

---

### Phase M3 completion note

Shipped in this continuation:

- Added `packages/engine-core` and extracted shared engine safety utilities:
  - `permissions.ts` (`evaluatePermissionAccess`)
  - `engine-limits.ts` (`MAX_METADATA_TREE_DEPTH`, ancestor helpers)
  - `sanitize.ts` (`sanitizeMetadata`)
  - `contracts.ts` (metadata component props contract)
  - `parse-with-schema.ts` (generic metadata parsing helper)
- Updated renderer to consume `@agnostic/engine-core` directly from:
  - `apps/renderer/src/engines/MetadataEngineItem.tsx`
  - `apps/renderer/src/lib/services/pages.ts`
  - sanitizer/engine-limit test suites
- Updated renderer parser wrappers to use shared `parseWithSchema(...)` helper.
- Removed duplicated renderer-local implementations that are now owned by engine-core:
  - `apps/renderer/src/lib/permissions.ts`
  - `apps/renderer/src/lib/metadata/engine-limits.ts`
  - `apps/renderer/src/utils/sanitize.ts`
  - `apps/renderer/src/utils/security.ts`
- Updated workspace path aliases (`apps/renderer/tsconfig.json`, `apps/renderer/vitest.config.ts`) for `@agnostic/engine-core`.
- Updated docs to reflect package ownership and new paths.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Notes:

- This M3 extraction keeps renderer read behavior unchanged and does not alter DB direction (builder writes, renderer reads).

---

### Phase M2.5 completion note

Shipped in this continuation:

- Added `packages/component-catalog` with canonical component entries:
  - component type IDs
  - display labels/categories
  - default metadata factories
  - inspector field contracts
- Rewired renderer registry to derive `COMPONENT_MAP` from catalog type keys.
- Rewired builder palette/inspector to generate from `@agnostic/component-catalog` instead of hardcoded component lists/defaults.
- Added parity enforcement tests:
  - `apps/renderer/src/registry/__tests__/component-catalog-parity.test.ts`
  - `packages/component-catalog/src/__tests__/catalog.test.ts`
- Updated workspace aliases (`apps/renderer/tsconfig.json`, `apps/renderer/vitest.config.ts`, `apps/builder/tsconfig.json`) for `@agnostic/component-catalog`.
- Added live phase tracker file: `docs/PHASE-M2.5-PROGRESS.md`.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test` (includes `packages/component-catalog/src/__tests__/*`)
- `npm run build`
- `npm run lint:builder`
- `npm run typecheck:builder`
- `npm run build:builder`

Notes:

- Renderer atom schemas remain local to renderer for now; parity tests guard drift between schema/registry and the shared catalog.
- Next planned monorepo phase is M7 (`ui-kit` extraction).

---

### Phase M4 completion note

Shipped in this continuation:

- Added `packages/data-access` as the renderer read boundary:
  - `contracts.ts` with `PublishedContentRepository` read contract
  - `repositories/published-content.ts` with `InMemoryPublishedContentRepository`
  - `mock-published-store.ts` transitional published dataset
- Rewired renderer services to consume `@agnostic/data-access` instead of direct mock page/layout imports:
  - `apps/renderer/src/lib/services/layout.ts`
  - `apps/renderer/src/lib/services/pages.ts`
- Removed direct renderer content mock file (`apps/renderer/src/data/mock-data.ts`) so page/layout reads go through data-access only.
- Updated workspace aliases (`apps/renderer/tsconfig.json`, `apps/renderer/vitest.config.ts`) for `@agnostic/data-access`.
- Updated docs (`02-getting-started`, `03-how-it-works`, `08-project-structure`, `TODOS`, and this report) for M4 architecture and status.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Notes:

- Renderer remains read-only against published content contracts.
- Builder-write and publish workflows are intentionally not implemented in M4; they remain the next vertical while preserving the builder-writes / renderer-reads boundary.

---

### Phase M5 completion note

Shipped in this continuation:

- Added `apps/builder` workspace scaffold with:
  - protected-route middleware (`apps/builder/middleware.ts`)
  - login/logout route handlers (`apps/builder/app/api/auth/*`)
  - builder MVP shell page (`apps/builder/app/builder/page.tsx`)
- Implemented M5 shell sections in builder UI:
  - site selector
  - component palette shell
  - canvas shell (JSON editor)
  - inspector shell
- Extended `packages/data-access` with draft repository contracts and in-memory implementation:
  - `DraftContentRepository` contract
  - `InMemoryDraftContentRepository` implementation
- Wired builder draft load/save to `@agnostic/data-access` from server actions in `apps/builder/app/builder/page.tsx`.
- Added root convenience scripts for builder workspace (`dev:builder`, `build:builder`, `lint:builder`, `typecheck:builder`, `start:builder`).
- Added live phase tracker file: `docs/PHASE-M5-PROGRESS.md`.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run lint:builder`
- `npm run typecheck:builder`
- `npm run build:builder`

Notes:

- Builder writes drafts through draft repository contracts.
- Renderer remains read-only through published repository contracts.
- Both repositories are currently in-memory and must be replaced with DB-backed implementations in later phases.

---

### Phase M6 completion note

Shipped in this continuation:

- Added builder interaction layer in `apps/builder/app/builder/BuilderStudio.tsx`:
  - drag/drop page reordering
  - undo/redo history
  - in-UI validation feedback
  - save draft + publish actions
- Added builder APIs:
  - `apps/builder/app/api/draft/route.ts` for loading/saving drafts
  - `apps/builder/app/api/publish/route.ts` for publish operations
- Extended `packages/data-access` with publish workflow and shared storage:
  - `publishDraftSiteVersion(...)` on draft repository contract/implementation
  - `src/storage/site-store.ts` shared filesystem-backed site store (`.data/sites/*.json`)
  - published repository now reads published snapshots from shared site store per site context
- Updated renderer read services to load the latest published snapshot on request (no in-process manifest cache).
- Added live phase tracker file: `docs/PHASE-M6-PROGRESS.md`.

Validation run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run lint:builder`
- `npm run typecheck:builder`
- `npm run build:builder`

Notes:

- Builder remains the write path (draft + publish), renderer remains read-only from published snapshots.
- Storage is transitional (filesystem) and is still planned to be replaced by a transactional DB-backed adapter in later phases.

---

*End of report — continue by appending dated log entries after each shipped hardening phase.*
