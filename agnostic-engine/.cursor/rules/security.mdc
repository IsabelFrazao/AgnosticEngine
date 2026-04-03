# Security & Architecture Rules: AgnosticEngine

## 1. Zero-Trust Rendering
- NEVER use `dangerouslySetInnerHTML`. 
- All string-based metadata MUST pass through `src/utils/sanitize.ts` before rendering.
- If a component fails validation, it must render the `DegradedStateUI` component, never a white screen.

## 2. Schema-First Development
- Every "Agnostic Atom" MUST have a corresponding Zod schema in `src/schemas/`.
- All component props must be inferred from these schemas using `z.infer`.
- The root schema in `src/schemas/root.schema.ts` must be updated whenever a new component type is added.

## 3. Action & Logic Decoupling
- Components are "Logic-Blind." They do not perform side effects.
- All events must emit an `actionId` to the `ActionRegistry`.
- Inline `eval()`, `new Function()`, or dynamic JS execution in metadata is strictly forbidden.

## 4. Error Observability
- All caught exceptions must be passed to `src/lib/logger.ts`.
- Do not use `console.log` for errors; use `logger.error` to ensure future Sentry compatibility.