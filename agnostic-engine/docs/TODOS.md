# TODOs — Honest Audit

This file contains an honest assessment of everything that is missing, broken, risky, or incomplete in the current codebase. Items are grouped by severity.

Last updated: 2026-04-23

---

## Critical — Will break in production or break the build

### ~~1. `vitest` is not installed~~ — **resolved**

**Files:** `package.json`, `.husky/pre-commit`, `package.json` (lint-staged)

`vitest` is referenced in three places:
- `"npm test"` script in `package.json`
- `lint-staged` config runs `vitest run --related --passWithNoTests`
- `.husky/pre-commit` runs `npm test`

This issue is resolved. `vitest`, `@vitest/ui`, and `jsdom` are now in `devDependencies`, and `npm test` is wired to `vitest run`.

---

### ~~2. RBAC is only partially implemented~~ — **partially resolved**

**Files:** Every component (`Button.tsx`, `Table.tsx`, `ThemeSwitcher.tsx`)

`MetadataEngineItem` enforces node-level `permissions` before render. RSC page routes and API page routes now also enforce page-level access checks, and `/api/pages` is permission-filtered per request.

Remaining gap: there is still no real authenticated identity/session provider; permissions can be passed by request header/cookie and default to empty when missing (dev keeps demo fallback).

**Fix:** Integrate authenticated session/API-derived permissions as the default source of truth and remove development-only fallback when identity is wired.

---

### ~~3. ActionRegistry has no registered actions (real features)~~ — **partially resolved**

**Files:** `src/registry/action-registry.ts`, `src/registry/registered-actions.ts`

**Partially resolved:** action bootstrap is now centralized in `src/registry/registered-actions.ts` and imported once in `app/layout.tsx`, so handlers are registered at app startup through a single, explicit boundary. The critical gap remaining is that handlers are still demo logger-backed; **real feature actions** are not yet wired.

**Fix:** Replace demo handlers in `registered-actions.ts` with real feature handlers as publish/save/preview flows are implemented.

---

## High — Significant gaps that limit real use

### ~~4. Recursive children have no depth limit~~ — **resolved**

**Files:** `src/engines/MetadataEngineItem.tsx`, `src/lib/metadata/engine-limits.ts`

Depth is capped via `MAX_METADATA_TREE_DEPTH`, and repeated `id` values on the ancestor path degrade with `cycle-detected` instead of recursing until stack overflow.

---

### ~~5. Test coverage is still thin~~ — **partially resolved**

**Files:** `src/**/__tests__`, `app/api/__tests__`

Vitest is wired and several suites exist (permissions, schema version, HTTP header helpers, engine guards, API contracts). Coverage now includes sanitizer behavior, metadata parsers, ActionRegistry semantics, and action bootstrap idempotence.

Remaining gap: theme/hydration hooks and richer integration-level render paths still need deeper coverage.

**Fix:** Add hook-level tests (`useTheme`, hydration edge cases) and targeted integration tests around degraded-state rendering and route authorization.

---

### ~~6. No schema version contract~~ — **partially resolved**

`Layout` and `PageManifestEntry` now carry `schemaVersion: "1.0"`, and API routes normalize payloads through migration helpers (`migrateLayout`, `migratePageManifestEntry`).

Remaining gap: there is only one supported version (`1.0`) and no real multi-version migration path yet.

**Fix:** when introducing `2.0`, add explicit `1.0 -> 2.0` migration functions and keep temporary `N-1` compatibility.

---

### ~~7. All data is static — no real API integration~~ — **resolved**

API route handlers are now defined (`app/api/layout/route.ts`, `app/api/pages/route.ts`, `app/api/page/[...slug]/route.ts`). They serve `MOCK_LAYOUT` and `MOCK_PAGES` and establish the API contract. `QueryProvider` is wired. To connect a real backend: replace the data source in the route handlers — no consumer changes needed.

---

## Medium — Code quality and observability gaps

### ~~8. Logger outputs to `console` only~~ — **partially resolved**

**Files:** `src/lib/logger.ts`

The logger now emits structured `LogEntry` objects through pluggable transports and includes an external reporter hook path (`globalThis.__AGNOSTIC_ENGINE_REPORTER__`). This provides a stable backend seam for production observability without changing logger call sites.

Remaining gap: provider-native SDK adapters (Sentry/Datadog) are still not wired; current remote sink path is generic env-based forwarding.

**Fix:** Add provider-specific transport(s) and call `setLoggerTransports(...)` in app bootstrap for each deployment environment. Keep `AE_LOG_INGEST_URL` as fallback/bridge.

---

### ~~9. `FormattedUtc` is not used in the Table component~~ — **resolved**

**Files:** `src/components/organisms/Table.tsx`, `src/components/atoms/FormattedUtc.tsx`

Table now detects ISO UTC strings in cell values and renders them with `FormattedUtc`.

Non-date values remain unchanged and render as plain strings.

**Status:** Resolved by wiring `FormattedUtc` into `Table` value rendering path.

---

### ~~10. No HTTP security headers~~ — **partially resolved**

**Files:** `next.config.ts`, `middleware.ts`, `src/lib/http-security-headers.ts`

Baseline CSP and standard security headers are applied via `next.config.ts`, backed by reusable helpers in `src/lib/http-security-headers.ts`. Root `middleware.ts` is a pass-through scaffold for future auth and rate limiting.

**Follow-up:** Tune CSP when adding third-party scripts, embeds, or CDNs; implement real checks in `middleware.ts`.

---

### ~~11. No CI/CD pipeline~~ — **resolved**

**Files:** `.github/` (does not exist)

This is now resolved with `.github/workflows/ci.yml` running lint, typecheck, and tests on push/PR.

**Follow-up:** Extend CI with build and contract-test stages as coverage grows.

---

## Low — Polish and future-readiness

### 12. Internationalization (i18n) is not implemented

**Files:** `app/layout.tsx`

Two explicit `TODO(i18n)` comments exist in `layout.tsx`:
- `lang="en"` is hardcoded on `<html>`
- The font subset list only covers Latin characters

**Fix:** Wire up `next-intl` or equivalent. Replace hardcoded `"en"` with a dynamic locale. Update font subsets.

---

### 13. No Playwright or end-to-end tests

The pre-commit hook runs unit tests only. There are no browser-level tests verifying that the actual rendered output matches expectations, themes apply correctly, or the anti-flash script works.

**Fix:** Add Playwright with at minimum: page renders without crashing, theme switcher changes the active theme, degraded state renders correctly for an invalid schema node.

---

### 14. `next.config.ts` only defines security headers

Beyond security headers (item 10), `next.config.ts` has no image optimization domains, redirects, or experimental flags yet. That is fine for now but will need attention before production deployment.

---

### ~~15. No error monitoring in production~~ — **partially resolved**

Related to item 8. Observability plumbing now exists, but production deployments still need an actual remote sink transport enabled to collect degraded/error events.

---

### 16. Sidebar nav icons not rendered

**Files:** `src/schemas/page.schema.ts`, `src/components/organisms/Sidebar.tsx`

`PageNavItem.icon` is defined in the schema and parsed by Zod, but the Sidebar does not render it — no icon library is installed. The field is reserved for future use.

**Severity:** Low

**Fix:** Install an icon library (e.g. `lucide-react`, which is zero-config with React 19). Update `NavItem` in `Sidebar.tsx` to render `icon` if present. Verify 2026 security standing before adding the dependency.

---

## Summary table

| # | Severity | Issue |
|---|----------|-------|
| ~~1~~ | ~~Critical~~ | ~~`vitest` not installed — commits and `npm test` fail~~ — **resolved** |
| 2 | Critical | RBAC boundaries are in place with secure default permissions, but identity/session source is still not integrated with real auth |
| 3 | Critical | ActionRegistry bootstrapping is resolved, but handlers are still demo stubs rather than real feature logic |
| ~~4~~ | ~~High~~ | ~~Recursive children have no depth limit~~ — **resolved** |
| 5 | High | Test coverage improved (sanitizer/parsers/ActionRegistry), but theme/hydration and deeper integration paths still need coverage |
| 6 | High | Schema versioning is partial (single-version contract, no multi-version migration yet) |
| ~~7~~ | ~~High~~ | ~~No real API integration~~ — **resolved**: API routes + QueryProvider wired |
| 8 | Medium | Logger transport seam and generic remote forwarding exist; provider-native monitoring adapters are still pending |
| ~~9~~ | ~~Medium~~ | ~~Table cells do not use `FormattedUtc` for date values~~ — **resolved** |
| ~~10~~ | ~~Medium~~ | ~~No HTTP security headers in `next.config.ts`~~ — **partially resolved** (baseline CSP + headers; CSP tuning TBD) |
| ~~11~~ | ~~Medium~~ | ~~No CI/CD pipeline~~ — **resolved** |
| 12 | Low | i18n not implemented (lang, font subsets hardcoded) |
| 13 | Low | No E2E tests |
| 14 | Low | `next.config.ts` only has security headers so far |
| 15 | Low | Production observability is partially resolved; provider-native transport wiring is still required per environment |
| ~~15~~ | ~~Low~~ | ~~Table uses row index as React key~~ — **resolved** |
| 16 | Low | Sidebar nav icons not rendered — `PageNavItem.icon` parsed but unused (no icon library installed) |
