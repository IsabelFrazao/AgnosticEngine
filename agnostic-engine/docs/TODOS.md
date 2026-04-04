# TODOs — Honest Audit

This file contains an honest assessment of everything that is missing, broken, risky, or incomplete in the current codebase. Items are grouped by severity.

Last updated: 2026-04-04

---

## Critical — Will break in production or break the build

### 1. `vitest` is not installed

**Files:** `package.json`, `.husky/pre-commit`, `package.json` (lint-staged)

`vitest` is referenced in three places:
- `"npm test"` script in `package.json`
- `lint-staged` config runs `vitest run --related --passWithNoTests`
- `.husky/pre-commit` runs `npm test`

But `vitest` is **not in `devDependencies`**. Running `npm test` or making any commit will fail with "vitest: command not found".

**Fix:** `npm install -D vitest @vitest/ui jsdom`

---

### 2. RBAC is wired but completely unimplemented

**Files:** Every component (`Button.tsx`, `Table.tsx`, `ThemeSwitcher.tsx`)

Every component receives `requiredPermissions?: string[]` and immediately does `void requiredPermissions`. This means **any user can see any component regardless of permissions**.

The schema supports it (`"permissions": ["courses:read"]`), the props are typed, but nothing enforces it.

**Fix:** Implement a permission check in `MetadataEngineItem` before rendering. Requires an auth context or a `currentUserPermissions` prop/hook.

---

### 3. ActionRegistry has no registered actions (real features)

**Files:** `src/registry/action-registry.ts`, `src/data/mock-schema.json`

**Partially resolved:** `src/data/mock-actions.ts` now registers 5 mock console-log handlers for all demo buttons, proving the infrastructure works correctly. The critical gap remaining is that **real feature actions** are not yet wired — when building actual features (publish, save, preview, etc.), each must be registered in `ActionRegistry` before its button can function.

**Fix:** As each feature is built, register its handlers early in the app lifecycle (e.g., a `src/registry/registered-actions.ts` imported in `app/layout.tsx`).

---

## High — Significant gaps that limit real use

### 4. Recursive children have no depth limit

**Files:** `src/engines/MetadataEngineItem.tsx`

`MetadataEngineItem` calls itself recursively for `node.children` with no maximum depth guard. A deeply nested or circular schema arriving from the database would cause a **call stack overflow** — which bypasses `ErrorBoundary` entirely (error boundaries only catch JS errors thrown during render, not stack overflows).

**Fix:** Pass a `depth` counter through the recursive call. At a configurable max (e.g. 10), render `<DegradedStateUI reason="max-depth-exceeded">` instead of recursing. Requires adding `'max-depth-exceeded'` to `DegradedStateUI`'s `reason` union type.

---

### 5. No tests exist

**Files:** None

There are zero test files in the entire project. The test infrastructure (vitest, lint-staged config) exists but is empty. Critical paths with no test coverage:

- `sanitizeMetadata()` — the security-critical HTML sanitizer
- `MetadataEngineItem` — the entire engine pipeline
- `parseButtonMetadata`, `parseTableMetadata` — parsers that could silently fail
- `ActionRegistry` — register/resolve/duplicate-key behavior
- `useClientReady` — SSR/hydration correctness
- `ThemeProvider` — localStorage read/write, invalid stored value handling

**Fix:** Install vitest, write unit tests for utils and parsers first (they are pure functions and easiest to test). Then integration tests for the engine.

---

### 6. All data is static — no real API integration

**Files:** `src/lib/api.ts`, `src/data/mock-schema.json`

`apiClient` (Axios) and TanStack Query are installed and configured, but **no component or page ever calls an API**. The schema is hardcoded JSON.

In a real use case, the schema would be fetched from a CMS or backend API and passed to `MetadataEngine`.

**Fix:** Add a data-fetching layer. Example: create `src/lib/services/schema-service.ts` that fetches the schema from `NEXT_PUBLIC_API_URL` using `apiClient`. Use TanStack Query in the page component to handle loading/error states.

---

## Medium — Code quality and observability gaps

### 7. Logger outputs to `console` only

**Files:** `src/lib/logger.ts`

The logger is a console wrapper. In production, errors are invisible unless someone has their browser console open. The Sentry integration is mentioned in comments but not implemented.

**Fix:** Integrate a real error monitoring service (Sentry, Datadog, etc.) by replacing `consoleLogger` with a Sentry-backed implementation. The interface is already designed for this.

---

### 8. `FormattedUtc` is not used in the Table component

**Files:** `src/components/organisms/Table.tsx`, `src/components/atoms/FormattedUtc.tsx`

Table cells are rendered with `String(row[c] ?? '')`. UTC date strings in table data display as raw ISO strings (`"2026-03-28T09:00:00.000Z"`) instead of formatted local times.

`FormattedUtc` exists and works correctly — it just is not used in `Table`.

**Fix:** Detect ISO date strings in table cell values and render them with `FormattedUtc`. Or add a column type hint to the table schema.

---

### 9. No HTTP security headers

**Files:** `next.config.ts`

`next.config.ts` is empty. There are no HTTP headers configured — no Content Security Policy, no `X-Frame-Options`, no `X-Content-Type-Options`, no HSTS.

**Fix:** Add a `headers()` function in `next.config.ts` with a strict CSP and standard security headers.

---

### 10. No CI/CD pipeline

**Files:** `.github/` (does not exist)

There is no GitHub Actions (or equivalent) configuration. Linting and tests only run on commit via Husky. Pushes to `main` are unguarded.

**Fix:** Add `.github/workflows/ci.yml` that runs `npm run lint` and `npm test` on every push and pull request.

---

## Low — Polish and future-readiness

### 11. Internationalization (i18n) is not implemented

**Files:** `app/layout.tsx`

Two explicit `TODO(i18n)` comments exist in `layout.tsx`:
- `lang="en"` is hardcoded on `<html>`
- The font subset list only covers Latin characters

**Fix:** Wire up `next-intl` or equivalent. Replace hardcoded `"en"` with a dynamic locale. Update font subsets.

---

### 12. No Playwright or end-to-end tests

The pre-commit hook runs unit tests only. There are no browser-level tests verifying that the actual rendered output matches expectations, themes apply correctly, or the anti-flash script works.

**Fix:** Add Playwright with at minimum: page renders without crashing, theme switcher changes the active theme, degraded state renders correctly for an invalid schema node.

---

### 13. `next.config.ts` is entirely empty

Beyond security headers (item 9), `next.config.ts` has no configuration at all — no image optimization domains, no redirects, no experimental features. This is fine now but will need attention before production deployment.

---

### 14. No error monitoring in production

Related to item 7. There is no way to know if users are hitting `DegradedStateUI` states in production. Silent failures are invisible.

---

## Summary table

| # | Severity | Issue |
|---|----------|-------|
| 1 | Critical | `vitest` not installed — commits and `npm test` fail |
| 2 | Critical | RBAC: `requiredPermissions` is ignored everywhere |
| 3 | Critical | ActionRegistry: mock actions registered; real feature actions still missing |
| 4 | High | Recursive children have no depth limit — stack overflow risk |
| 5 | High | Zero tests |  
| 6 | High | No real API integration — all data is static mock |
| 7 | Medium | Logger is console-only — no production error monitoring |
| 8 | Medium | Table cells do not use `FormattedUtc` for date values |
| 9 | Medium | No HTTP security headers in `next.config.ts` |
| 10 | Medium | No CI/CD pipeline |
| 11 | Low | i18n not implemented (lang, font subsets hardcoded) |
| 12 | Low | No E2E tests |
| 13 | Low | `next.config.ts` empty |
| 14 | Low | No production error observability |
| ~~15~~ | ~~Low~~ | ~~Table uses row index as React key~~ — **resolved** |
| 15 | Low | Table uses row index as React key |
