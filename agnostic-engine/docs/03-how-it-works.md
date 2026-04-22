# How It Works

## The core idea

Every page in AgnosticEngine is defined by a **schema** — an array of JSON objects. Each object describes one UI element: its type, its properties, its permissions, and optionally its children.

The engine reads that array and renders it. It never knows what "Publish" means, or why a button is blue, or who is allowed to see a table. It just follows the schema.

---

## The pipeline

Every single item in the schema passes through this exact sequence before anything appears on screen:

```
JSON Schema (array of nodes)
    │
    ▼
MetadataEngine                    src/engines/MetadataEngine.tsx
    │  iterates the array
    ▼
MetadataEngineItem                src/engines/MetadataEngineItem.tsx
    │
    ├─ Step 1: MetadataNodeSchema.safeParse()
    │          Validates the item against all known component schemas.
    │          If invalid → logs error + renders DegradedStateUI. Stops here.
    │
    ├─ Step 2: Permission check
    │          `node.permissions` is evaluated against current user permissions.
    │          If missing permissions → logs warning + renders DegradedStateUI. Stops here.
    │
    ├─ Step 3: sanitizeMetadata()
    │          Strips dangerous HTML from all string values in props.
    │          Only <b>, <i>, <strong> are allowed (no attributes).
    │
    ├─ Step 4: COMPONENT_MAP[node.type]
    │          Looks up the React component registered for this type.
    │          If unknown type → logs error + renders DegradedStateUI. Stops here.
    │
    ├─ Step 5: Render inside ErrorBoundary + Suspense
    │          ErrorBoundary catches any crash → DegradedStateUI.
    │          Suspense shows a Skeleton while lazy-loaded components load.
    │
    └─ Step 6: Recurse into node.children (if any)
               Each child goes through this same pipeline.
```

**Nothing bypasses this pipeline.** Raw metadata never reaches a component.

---

## The schema format

A schema is an array. Each node looks like this:

```json
{
  "id": "action-publish",
  "type": "button",
  "props": {
    "metadata": {
      "labelKey": "Publish module",
      "variant": "primary"
    }
  },
  "permissions": ["courses:write"],
  "children": []
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique string identifier for this node |
| `type` | Yes | Which component to render (`"button"`, `"table"`, `"theme-switcher"`) |
| `props.metadata` | No | Component-specific configuration (varies by type) |
| `permissions` | No | RBAC permission strings. Nodes render only when the current user has all required permissions. |
| `children` | No | Array of child nodes — same format, rendered inside this component |

---

## The schema shape

The full schema has two top-level keys served by the API:

```
GET /api/layout   → shared shell (navbar, footer, notifications, sidebar config)
GET /api/pages    → pages manifest (slug, title, nav, permissions — no components)
GET /api/page/:slug → full page (header + components for that slug only)
```

### `layout`

```json
{
  "sidebar": { "extras": [{ "label": "Docs", "href": "...", "order": 99 }] },
  "navbar": [],
  "footer": [],
  "notifications": []
}
```

### `pages` — single source of truth for content AND navigation

```json
{
  "/courses": {
    "title": "Courses",
    "nav": { "label": "Courses", "order": 1 },
    "permissions": ["courses:read"],
    "header": { "title": "Courses", "description": "Manage modules." },
    "components": [ ...MetadataNode[] ]
  },
  "/courses/modules": {
    "title": "Modules",
    "nav": { "label": "Modules", "order": 0, "parent": "/courses" },
    "components": []
  }
}
```

Adding `nav` to a page entry makes it appear in the sidebar automatically (Law of Derivation). Adding `nav.parent` nests it under a parent — no other file changes needed.

---

## The Three Laws

These are non-negotiable rules enforced in code, Cursor rules, and CLAUDE.md.

### Law of Discovery

When you create a new component type (called an "Atom"), you must do exactly four things. No more, no less. The engine rebuilds automatically.

1. Create `src/schemas/atoms/{type}.schema.ts` — the Zod validation schema
2. Register in `src/schemas/atoms/index.ts` → `ATOM_SCHEMAS`
3. Register in `src/registry/component-registry.ts` → `COMPONENT_MAP`
4. Create `src/lib/metadata/parse-{type}-metadata.ts` — the metadata parser

See [Adding a Component](./05-adding-a-component.md) for a full walkthrough.

### Law of Purity

Components are **logic-blind**. They render things; they do not make decisions.

- A component never imports a function to call when a button is clicked.
- All interactive events dispatch an `actionId` string to `ActionRegistry`.
- The registry resolves the actual handler. The component never knows what it does.
- No `eval()`, no `new Function()`, no dynamic code execution via metadata.

This means you can change what "Publish" does without touching the button component.

### Law of Derivation

The `pages` map is the **only** source of truth for both page content and sidebar navigation.

- A page with `nav` is automatically listed in the sidebar. No other step required.
- A page with `nav.parent` is automatically nested under its parent. The parent entry is not touched.
- `sidebar.extras` is the only exception: non-page items (external links). Use sparingly.
- `nav.order` is a JavaScript sort key applied before DOM render — not a CSS property.

### Law of Validation

No metadata reaches a component's `render` phase without passing through:
1. `MetadataNodeSchema.safeParse()` — structural shape validation
2. `sanitizeMetadata()` — HTML stripping

On failure: `logger.error()` + `<DegradedStateUI>`. The page never crashes; it degrades gracefully.

---

## The registries

Two registries act as whitelists:

### COMPONENT_MAP (`src/registry/component-registry.ts`)

Maps a `type` string to a React component. If a type is in the schema but not here, the engine shows `DegradedStateUI`. TypeScript enforces that every type in `ATOM_SCHEMAS` has an entry here at compile time.

```ts
export const COMPONENT_MAP: Record<ComponentType, EngineComponent> = {
  button:           Button,
  table:            Table,
  'theme-switcher': ThemeSwitcher,
};
```

### ActionRegistry (`src/registry/action-registry.ts`)

Maps an `actionId` string to an event handler function. Buttons that specify an `actionId` look it up here. If the `actionId` is not registered, the button renders as disabled and logs a warning. No code can be injected via the schema.

```ts
ActionRegistry.register({
  id: 'publish-module',
  label: 'Publish the current module',
  handler: () => { /* your logic here */ },
});
```

---

## Schema validation in depth

The root schema (`src/schemas/root.schema.ts`) is a **recursive discriminated union** built automatically from `ATOM_SCHEMAS`. This means:

- You never need to touch `root.schema.ts` when adding a new atom type.
- TypeScript and Zod both enforce the valid shapes at compile time and runtime.
- The `children` field is added to every atom via `z.lazy`, enabling infinite nesting.

---

## What happens when something goes wrong

| Failure | What the user sees | What gets logged |
|---------|-------------------|-----------------|
| Invalid schema (wrong type, missing required field) | "Component unavailable" box | `logger.error` with Zod issues |
| Missing required permissions | "Component unavailable" box | `logger.warn` with missing permissions |
| Unknown `type` string | "Component unavailable" box | `logger.error` with the unknown type |
| Component throws during render | "Component unavailable" box | `logger.error` with the error |
| `actionId` not registered | Button renders disabled | `logger.warn` with the `actionId` |

In development, the "Component unavailable" box shows the component ID, type, and reason. In production, it shows only "Component unavailable".

---

## Themes

The active theme is stored in the user's browser (`localStorage` key: `agnostic-theme`). An anti-flash inline script in `app/layout.tsx` reads the stored theme before React hydrates, so the correct theme is applied before the first paint. See [Theming](./06-theming.md) for the full explanation.
