# Adding a New Component (Atom)

This is the **Law of Discovery** in practice. Every new atom requires exactly four steps. TypeScript will give you a compile error if you miss step 3, and the schema will reject unknown types at runtime if you miss step 2.

The example below adds a hypothetical `"badge"` component.

---

## Step 1 — Create the schema file

Create `src/schemas/atoms/badge.schema.ts`:

```ts
import { z } from 'zod';

/** Inner metadata shape for the Badge component. */
export const badgeMetadataSchema = z.object({
  text:    z.string().min(1),
  color:   z.enum(['green', 'red', 'yellow', 'grey']),
  outline: z.boolean().optional(),
});

/**
 * Full engine node for type: "badge".
 * `children` is attached by root.schema.ts — do not add it here.
 */
export const badgeAtomNodeBaseSchema = z.object({
  id:          z.string().min(1),
  type:        z.literal('badge'),
  props:       z.object({ metadata: badgeMetadataSchema }).optional(),
  permissions: z.array(z.string()).optional(),
});
```

Rules:
- Export both `{type}MetadataSchema` and `{type}AtomNodeBaseSchema`
- `type` must be a `z.literal` matching the string you will use in schemas
- Do not add `children` here — `root.schema.ts` adds it automatically

---

## Step 2 — Register in ATOM_SCHEMAS

Open `src/schemas/atoms/index.ts` and add your import and entry:

```ts
import { badgeAtomNodeBaseSchema } from './badge.schema';

export const ATOM_SCHEMAS = {
  button:           buttonAtomNodeBaseSchema,
  table:            tableAtomNodeBaseSchema,
  'theme-switcher': themeSwitcherAtomNodeBaseSchema,
  badge:            badgeAtomNodeBaseSchema,   // ← add this
} satisfies Record<string, AtomNodeBaseSchema>;
```

After this, `root.schema.ts` automatically includes `"badge"` in the discriminated union. `MetadataNodeSchema.safeParse()` will now accept badge nodes.

---

## Step 3 — Register in COMPONENT_MAP

Open `src/registry/component-registry.ts` and add your import and entry:

```ts
import { Badge } from '@/src/components/atoms/Badge';

export const COMPONENT_MAP: Record<ComponentType, EngineComponent> = {
  button:           Button,
  table:            Table,
  'theme-switcher': ThemeSwitcher,
  badge:            Badge,   // ← add this
};
```

TypeScript enforces completeness: if you added `badge` to `ATOM_SCHEMAS` but forgot this step, you get a compile error here on the `Record<ComponentType, EngineComponent>` type.

---

## Step 4 — Create the parser and component

**Parser** — `src/lib/metadata/parse-badge-metadata.ts`:

```ts
import type { z } from 'zod';
import { badgeMetadataSchema } from '@/src/schemas/atoms/badge.schema';

export type BadgeMetadata = z.infer<typeof badgeMetadataSchema>;

export { badgeMetadataSchema };

export function parseBadgeMetadata(raw: unknown): BadgeMetadata {
  return badgeMetadataSchema.parse(raw);
}
```

**Component** — `src/components/atoms/Badge.tsx`:

```tsx
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { parseBadgeMetadata } from '@/src/lib/metadata/parse-badge-metadata';

const COLOR_CLASSES = {
  green:  'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
  red:    'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  grey:   'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
};

export function Badge({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { text, color, outline = false } = parseBadgeMetadata(metadata);

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${outline ? 'border border-current bg-transparent' : COLOR_CLASSES[color]}
      `}
    >
      {text}
    </span>
  );
}
```

Rules for every component:
- Accept `MetadataComponentProps` — never custom props
- Call the parser immediately — never access `metadata` keys directly
- Use `void requiredPermissions` until RBAC is implemented
- Use CSS variables for colors, not hardcoded hex values
- No direct function calls for events — use `ActionRegistry` if interactivity is needed

---

## After all four steps

No other file needs to change. You can now use the new type in any schema:

```json
{
  "id": "status-badge",
  "type": "badge",
  "props": {
    "metadata": {
      "text": "Published",
      "color": "green"
    }
  }
}
```

---

## Checklist

- [ ] `src/schemas/atoms/badge.schema.ts` created with `badgeMetadataSchema` and `badgeAtomNodeBaseSchema`
- [ ] `src/schemas/atoms/index.ts` updated — entry added to `ATOM_SCHEMAS`
- [ ] `src/registry/component-registry.ts` updated — entry added to `COMPONENT_MAP`
- [ ] `src/lib/metadata/parse-badge-metadata.ts` created
- [ ] `src/components/atoms/Badge.tsx` created
- [ ] **Update `docs/04-components.md`** — document the new component's schema and metadata fields

---

## Adding an Organism instead of an Atom

Organisms (`src/components/organisms/`) are larger, more complex components that should be **lazy-loaded**. The only difference from atoms is how they are imported in `component-registry.ts`:

```ts
// Atoms: static import
import { Badge } from '@/src/components/atoms/Badge';

// Organisms: dynamic import (lazy)
const MyOrganism = dynamic(() =>
  import('@/src/components/organisms/MyOrganism').then((m) => ({ default: m.MyOrganism }))
);
```

Everything else (schema, ATOM_SCHEMAS, parser) is identical.
