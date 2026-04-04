# Components

AgnosticEngine has two categories of components:

- **Atoms** — small, self-contained, static imports
- **Organisms** — larger blocks, lazy-loaded (only downloaded when needed)

All components receive the same two props:

```ts
type MetadataComponentProps = {
  metadata?: Record<string, unknown>;   // component-specific config from the schema
  requiredPermissions?: string[];        // RBAC slot (not yet enforced)
};
```

The actual shape of `metadata` is validated and typed differently for each component by its parser (`src/lib/metadata/parse-{type}-metadata.ts`).

---

## Atoms

### Button

**File:** `src/components/atoms/Button.tsx`
**Schema:** `src/schemas/atoms/button.schema.ts`
**Parser:** `src/lib/metadata/parse-button-metadata.ts`

Renders a `<button>` element. Resolves its click handler from `ActionRegistry` if `actionId` is provided.

#### Schema

```json
{
  "id": "my-button",
  "type": "button",
  "props": {
    "metadata": {
      "labelKey": "Save changes",
      "variant": "primary",
      "isDisabled": false,
      "actionId": "save-changes"
    }
  },
  "permissions": ["content:write"]
}
```

#### Metadata fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `labelKey` | `string` (min 1 char) | Yes | The button label text |
| `variant` | `"primary" \| "secondary" \| "outline"` | Yes | Visual style |
| `isDisabled` | `boolean` | No (default `false`) | Render the button disabled |
| `actionId` | `string` | No | ID to look up in `ActionRegistry`. If not found, button is disabled. |

#### Variants

| Variant | Appearance |
|---------|-----------|
| `primary` | Filled blue background, white text |
| `secondary` | Filled light grey background, dark text |
| `outline` | Transparent, bordered, muted hover |

#### Notes

- If `actionId` is set but not registered in `ActionRegistry`, the button is **automatically disabled** and a warning is logged. The schema remains valid.
- RBAC: `requiredPermissions` is threaded through but not yet enforced. See [TODOS.md](./TODOS.md).

---

### ThemeSwitcher

**File:** `src/components/atoms/ThemeSwitcher.tsx`
**Schema:** `src/schemas/atoms/theme-switcher.schema.ts`
**Parser:** `src/lib/metadata/parse-theme-switcher-metadata.ts`

Renders a group of toggle buttons, one per theme. The active theme is highlighted. Clicking a button saves the selection to `localStorage` and applies the CSS variable set.

Defers rendering until after browser hydration to prevent a server/client mismatch on `aria-pressed`.

#### Schema

```json
{
  "id": "page-theme-switcher",
  "type": "theme-switcher",
  "props": {
    "metadata": {
      "groupLabel": "Color theme",
      "visibleThemes": ["light", "dark", "ocean"]
    }
  }
}
```

#### Metadata fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupLabel` | `string` (min 1 char) | No (default `"Theme"`) | `aria-label` for the button group |
| `visibleThemes` | `Array<ThemeId>` (min 1) | No | Restrict which themes are shown. If omitted, all 5 are shown. |

#### Available theme IDs

`"system"` · `"light"` · `"dark"` · `"ocean"` · `"forest"`

---

### DegradedStateUI

**File:** `src/components/atoms/DegradedStateUI.tsx`

Not a schema component. Rendered automatically by the engine when a component fails to validate, has an unknown type, or throws during render.

In **development**: shows the component ID, type, and failure reason.
In **production**: shows only "Component unavailable".

#### Failure reasons

| `reason` | When it appears |
|----------|----------------|
| `'invalid-schema'` | Node failed `MetadataNodeSchema.safeParse()` |
| `'unknown-type'` | `type` string has no entry in `COMPONENT_MAP` |
| `'render-error'` | Component threw a runtime error during render (caught by `ErrorBoundary`) |

You never use this directly in a schema.

---

### Skeleton

**File:** `src/components/atoms/Skeleton.tsx`

A pulsing grey placeholder shown while lazy-loaded organisms are downloading. Accepts an optional `className` for sizing.

```tsx
<Skeleton className="h-10 w-full" />
```

You never use this directly in a schema.

---

### FormattedUtc

**File:** `src/components/atoms/FormattedUtc.tsx`

Takes an ISO 8601 UTC string and displays it formatted for the user's local timezone using `date-fns`. Shows the raw string on the server (to avoid hydration mismatch) and the formatted string after hydration.

```tsx
<FormattedUtc iso="2026-04-01T12:00:00.000Z" />
// Renders: "April 1st, 2026 at 12:00 PM" (locale-dependent)
```

This component is **not yet wired into Table** — table cells display raw strings. See [TODOS.md](./TODOS.md).

---

## Organisms

### Table

**File:** `src/components/organisms/Table.tsx`
**Schema:** `src/schemas/atoms/table.schema.ts`
**Parser:** `src/lib/metadata/parse-table-metadata.ts`

Renders an HTML `<table>` from columns and rows defined in the schema. Lazy-loaded (uses `next/dynamic`) — it is only downloaded when a schema includes a `"table"` node.

#### Schema

```json
{
  "id": "courses-table",
  "type": "table",
  "props": {
    "metadata": {
      "columns": ["Module", "Status", "Last Updated"],
      "rows": [
        {
          "Module": "Introduction to TypeScript",
          "Status": "Published",
          "Last Updated": "2026-03-28T09:00:00.000Z"
        }
      ]
    }
  },
  "permissions": ["courses:read"]
}
```

#### Metadata fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `columns` | `string[]` (min 1) | Yes | Column header names, in display order |
| `rows` | `Record<string, unknown>[]` | Yes | Row data. Keys must match column names. |
| `caption` | `string` (min 1) | No | Visible table caption rendered as `<caption>`. If omitted, an `aria-label` is auto-generated from column names to maintain A11y compliance. |

#### Notes

- Row values are rendered as plain strings via `String(value ?? '')`.
- Date values are **not** auto-formatted — they display as raw strings. `FormattedUtc` is not currently used here. See [TODOS.md](./TODOS.md).
- Columns not present in `columns` array are ignored even if present in a row.

---

## Utility components (not schema-driven)

These exist in the codebase but are not registered in `COMPONENT_MAP`. They are used internally by other components or directly in page layouts.

| Component | Used by |
|-----------|---------|
| `Skeleton` | `MetadataEngineItem` (Suspense fallback) |
| `DegradedStateUI` | `MetadataEngineItem` (validation failure) |
| `FormattedUtc` | `app/page.tsx` (demo date display) |
