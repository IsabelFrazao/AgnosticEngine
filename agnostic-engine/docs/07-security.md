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
- **Never use `console.log` directly** — always use `logger.error` or `logger.warn`
- Never `catch` an error silently without calling `logger.error`

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
| RBAC / permissions | `requiredPermissions` prop is passed but `void`-ed — no access control enforced | [TODOS.md](./TODOS.md) |
| Sentry / remote logging | Errors only go to `console` in production | [TODOS.md](./TODOS.md) |
| Content Security Policy headers | `next.config.ts` is empty — no CSP headers set | [TODOS.md](./TODOS.md) |
| Rate limiting / auth | No API routes with auth yet | [TODOS.md](./TODOS.md) |

---

## Summary — what the engine guarantees

| Guarantee | Mechanism |
|-----------|----------|
| Unknown component types never render | Zod discriminated union + registry lookup |
| Arbitrary HTML/JS cannot be injected via metadata | Sanitizer strips everything except `<b>`, `<i>`, `<strong>` |
| Arbitrary code cannot be triggered via button metadata | ActionRegistry whitelist |
| A failing component cannot crash the whole page | ErrorBoundary per node |
| Invalid environment config is caught at startup | Zod-validated `src/env.ts` |
| All failures are observable | Centralized `logger` |
