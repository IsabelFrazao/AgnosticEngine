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
- `src/lib/metadata/engine-limits.ts` — `MAX_METADATA_TREE_DEPTH`, ancestor helpers
- `src/components/atoms/DegradedStateUI.tsx` — reason union includes guard reasons

### Data & API

- **Services (single validated path for RSC + route handlers):**
  - `src/lib/services/pages.ts` — manifest, nav slice, `getPageEntry`, `getHomePageEntry`, `getStaticPathParams`, `DEMO_UPDATED_AT`
  - `src/lib/services/layout.ts` — `getLayout()`
  - `src/lib/services/current-user.ts` — `getCurrentUserPermissions()` (demo)

- **App Router** imports **services only** (not `mock-data`):
  - `app/page.tsx`, `app/[...slug]/page.tsx`, `app/layout.tsx`

- **API:** `app/api/*/route.ts` delegates to the same services.

- **Mock source of truth (until DB):** `src/data/mock-data.ts`, `src/data/mock-auth.ts`

### Schema version

- `schemaVersion: "1.0"` on layout + page entries
- Helpers: `src/lib/metadata/schema-version.ts`, `migrate-layout.ts`, `migrate-page-manifest-entry.ts`
- Zod: `src/schemas/page.schema.ts` (`SchemaVersionSchema`, defaults)

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

*End of report — continue by appending dated log entries after each shipped hardening phase.*
