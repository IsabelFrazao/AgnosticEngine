# Security

## Overview

AgnosticEngine treats all incoming metadata as untrusted input. Even metadata that comes from your own backend must pass through the security pipeline before anything is rendered. This section explains every layer of that pipeline.

---

## Layer 1 — Schema validation (Zod)

**Where:** `src/engines/MetadataEngineItem.tsx`, using `MetadataNodeSchema` from `src/schemas/root.schema.ts`

Every metadata node is validated against a strict Zod discriminated union before anything else happens. This means:

- Unknown `type` values are **rejected** — you cannot inject a new component type via metadata
- Missing required fields cause the node to fail gracefully, not crash
- Extra unknown fields at the node level are stripped by Zod's default behavior
- The exact shape of `props.metadata` is also validated per component type

If validation fails, the engine logs the error and shows `DegradedStateUI`. The component never receives the data.

---

## Layer 2 — HTML sanitization

**Where:** `src/utils/security.ts`, called via `src/utils/sanitize.ts`

After schema validation, all string values in `props` are recursively sanitized. The sanitizer:

- Strips **all HTML tags** except `<b>`, `<i>`, and `<strong>`
- Removes **all attributes** from allowed tags (prevents `onclick=`, `href=`, `style=`, etc.)
- Works on nested objects and arrays recursively
- Is **SSR-safe** — no DOM dependency, runs on both server and client

```
"<b onclick='steal()'>Bold</b>"  →  "<b>Bold</b>"
"<script>alert(1)</script>"      →  ""
"<img src=x onerror=alert(1)>"  →  ""
```

The sanitizer runs **after** Zod validation, so by the time it runs, it is working on a known, constrained shape — not arbitrary JSON.

`dangerouslySetInnerHTML` is **never used** anywhere in the codebase. All text is rendered as React children (plain strings), so React's built-in escaping handles the rest.

---

## Layer 2.5 — Permission enforcement (component boundary)

**Where:** `src/engines/MetadataEngineItem.tsx`, using `evaluatePermissionAccess` from `src/lib/permissions.ts`

Before rendering a validated node, the engine checks `node.permissions` against the current user's permission set.

- If all required permissions are present, rendering continues.
- If any permission is missing, the engine logs a warning and renders `DegradedStateUI` with `insufficient-permissions`.

This keeps node-level access control centralized in the engine boundary rather than duplicated in each component.

---

## Layer 2.6 — Route and API authorization boundary

**Where:** `src/lib/services/current-user.ts`, `src/lib/services/pages.ts`, `app/page.tsx`, `app/[...slug]/page.tsx`, `app/api/pages/route.ts`, `app/api/page/[...slug]/route.ts`

The application now enforces page-level permissions at route boundaries in addition to node-level checks:

- **RSC pages** (`/` and `/[...slug]`) resolve current permissions and block unauthorized page access with `notFound()`.
- **API routes** enforce the same page permission contract and return `403` for unauthorized page payload requests.
- **Navigation payloads** from `/api/pages` are permission-filtered so clients only receive allowed pages.

Identity/permission resolution currently supports:

1. `x-ae-permissions` request header (highest precedence)
2. `ae_permissions` cookie
3. Local fallback (`MOCK_CURRENT_USER_PERMISSIONS`) for demo/dev continuity

This keeps authorization logic inside service boundaries instead of scattering ad hoc checks across components and handlers.

---

## Layer 3 — ActionRegistry whitelist

**Where:** `src/registry/action-registry.ts`

Buttons can specify an `actionId` in their metadata to trigger behavior when clicked. The `ActionRegistry` is a singleton Map of pre-registered handlers. Key rules:

- Handlers must be **registered in code** before they can be triggered
- There is no way to register a handler via the JSON schema — only application code can call `ActionRegistry.register()`
- If a button's `actionId` is not in the registry, the button renders **disabled** — it cannot be clicked at all
- Duplicate `actionId` registrations throw an error at startup, not silently overwrite

This means no metadata can ever inject arbitrary JavaScript execution.

```ts
// Safe: registered in code
ActionRegistry.register({
  id: 'publish-module',
  label: 'Publish the current module',
  handler: () => publishModule(),
});

// Impossible: this JSON cannot execute code
{ "actionId": "javascript:alert(1)" }  // → button is disabled, warning logged
```

---

## Layer 4 — Error boundary

**Where:** `src/engines/MetadataEngineItem.tsx`, using `react-error-boundary`

Every component render is wrapped in an `ErrorBoundary`. If a component throws for any reason (runtime error, bad data that slipped through), the error boundary catches it and renders `DegradedStateUI` for that component only. The rest of the page continues rendering normally.

This prevents a single broken component from crashing the entire application.

---

## Layer 5 — Logger

**Where:** `src/lib/logger.ts`

All security-relevant events (validation failures, unknown types, unregistered actions) are routed through the `logger` singleton. Currently it writes to the browser/Node console. The logger is designed for easy replacement:

```ts
// Swap this export to send to Sentry, Datadog, etc.
export const logger: AppLogger = consoleLogger;
```

Rules:
- **Never use `console.log` directly** — always use `logger.info`, `logger.warn`, or `logger.error`
- Never `catch` an error silently without calling `logger.error`

---

## Layer 6 — HTTP security headers

**Where:** `next.config.ts` (uses `getSecurityHeaders` from `src/lib/http-security-headers.ts`)

Responses include a baseline policy suitable for this app:

- **Content-Security-Policy** — `default-src 'self'`, tight `frame-ancestors`, `connect-src 'self'`, and (in development only) `'unsafe-eval'` for Next.js tooling. Tighten further when you add third-party scripts, analytics, or CDNs.
- **X-Content-Type-Options: nosniff**
- **X-Frame-Options: DENY** (paired with `frame-ancestors 'none'` in CSP)
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — disables camera, microphone, and geolocation by default
- **Strict-Transport-Security** — applied only when `NODE_ENV !== 'development'`

**Where:** `middleware.ts` (root)

Thin pass-through today — intended extension point for auth, tenancy, and rate limiting without scattering logic across routes.

---

## Environment variables

**Where:** `src/env.ts`

All environment variables are validated at startup using Zod. If a required variable is missing or has the wrong format, the application throws immediately with a clear error message — it does not start in a broken state.

New environment variables must be:
1. Added to the Zod schema in `src/env.ts`
2. Added to `.env.example` with a comment explaining the expected value
3. Documented in [Getting Started](./02-getting-started.md)

Access environment variables via `env.NEXT_PUBLIC_API_URL` (the validated object), never via `process.env.NEXT_PUBLIC_API_URL` directly.

---

## What is NOT yet implemented

| Gap | Risk | Tracking |
|-----|------|---------|
| Session-backed identity provider | Route and API permission checks are implemented, but effective permissions still fall back to demo defaults when no real auth/session source is connected | [TODOS.md](./TODOS.md) |
| Sentry / remote logging | Errors only go to `console` in production | [TODOS.md](./TODOS.md) |
| CSP tuning for third parties | Baseline CSP is strict; any new external script or iframe host must be reflected in `src/lib/http-security-headers.ts` | [TODOS.md](./TODOS.md) |
| Rate limiting / auth | Middleware is a scaffold only — no enforcement on `/api` yet | [TODOS.md](./TODOS.md) |

---

## Summary — what the engine guarantees

| Guarantee | Mechanism |
|-----------|----------|
| Unknown component types never render | Zod discriminated union + registry lookup |
| Arbitrary HTML/JS cannot be injected via metadata | Sanitizer strips everything except `<b>`, `<i>`, `<strong>` |
| Arbitrary code cannot be triggered via button metadata | ActionRegistry whitelist |
| A failing component cannot crash the whole page | ErrorBoundary per node |
| Invalid environment config is caught at startup | Zod-validated `src/env.ts` |
| Baseline transport security headers on responses | `next.config.ts` + `src/lib/http-security-headers.ts` |
| All failures are observable | Centralized `logger` |
