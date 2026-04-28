# UI Kit Expansion Progress

Scope: shared components/themes for renderer + builder parity while keeping app-specific data providers local.

- ✅ Extracted shared theme primitives to `packages/ui-kit/src/theme/*`
- ✅ Extracted shared presentational components to `packages/ui-kit/src/components/*`
- ✅ Kept `QueryProvider` renderer-local (not shared)
- ✅ Rewired renderer shell and schema/theme references to `@agnostic/ui-kit`
- ✅ Removed duplicated renderer-local theme/fallback/sidebar files replaced by ui-kit
- ✅ Validation gates green (lint, typecheck, test, build for renderer + builder)
