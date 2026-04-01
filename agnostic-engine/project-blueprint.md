# Agnostic Metadata CMS (Enterprise v3.0)
**Core:** Metadata-driven Next.js Architecture.

## Pillars
- **Agnostic UI:** Components consume `props.metadata`. No hardcoding.
- **Data Layer:** Axios (Interceptors) + TanStack Query (Lazy Loading).
- **Security:** RBAC slots in MetadataEngine + Zod Env validation.
- **UX:** Skeleton screens for all atoms via React Suspense.
- **Dates:** Always UTC strings; local formatting via `date-fns`.

## Tools
- Cursor (IDE/Orchestration)
- Claude Code (CLI/Batch production/Backend)
- v0.dev (UI Logic/Radix primitives)
