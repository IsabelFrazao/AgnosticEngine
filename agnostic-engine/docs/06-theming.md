# Theming

## Overview

AgnosticEngine has a built-in theme system with 5 themes. The active theme is stored in the user's browser and applied without a page flash. All colors in every component come from CSS variables — no hardcoded hex codes in component files.

---

## Available themes

| ID | Label | Description |
|----|-------|-------------|
| `system` | System | Follows the OS dark/light preference |
| `light` | Light | White background, blue primary |
| `dark` | Dark | Dark slate background, blue primary |
| `ocean` | Ocean | Light cyan background, teal primary |
| `forest` | Forest | Light green background, green primary |

---

## How themes work

### 1. CSS custom properties

All colors are defined as CSS variables in `app/globals.css`. The `:root` block defines the default (light) values. Each `[data-theme="..."]` block overrides the full set:

```css
:root {
  --color-primary: #1d4ed8;
  --color-foreground: #0f172a;
  /* ... all other tokens */
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-foreground: #f1f5f9;
  /* ... */
}
```

### 2. System theme

When `theme = "system"`, no `data-theme` attribute is set on `<html>`. A `@media (prefers-color-scheme: dark)` block in CSS then kicks in:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* dark values */
  }
}
```

### 3. Storing the selection

The selected theme is saved to `localStorage` under the key `agnostic-theme`. On the next page load, a small inline script in `<head>` reads it and sets `data-theme` on `<html>` **before React hydrates** — preventing a flash of the wrong theme.

### 4. React state

`ThemeProvider` (`src/lib/theme/theme-context.tsx`) wraps the entire app and exposes `theme` and `setTheme` via context. Components access it via `useTheme` (`src/hooks/useTheme.ts`).

---

## Using theme tokens in components

Always use CSS variables — never hardcode hex values:

```tsx
// Correct
className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"

// Wrong
className="bg-[#1d4ed8] text-white"
```

Available tokens:

| Variable | Usage |
|----------|-------|
| `--background` | Page background |
| `--foreground` | Default text color |
| `--color-surface` | Card / panel background |
| `--color-surface-raised` | Elevated surface (dropdowns, popovers) |
| `--color-primary` | Primary button / accent fill |
| `--color-primary-foreground` | Text on primary fill |
| `--color-primary-hover` | Primary hover state |
| `--color-secondary` | Secondary button fill |
| `--color-secondary-foreground` | Text on secondary fill |
| `--color-secondary-hover` | Secondary hover state |
| `--color-muted` | Subtle background (code blocks, tags) |
| `--color-muted-foreground` | Secondary / placeholder text |
| `--color-border` | Borders, dividers |
| `--color-ring` | Focus ring |
| `--color-table-header` | Table header cell background |
| `--color-table-border` | Table border color |
| `--color-skeleton` | Skeleton loader pulse color |
| `--radius-brand` | Border radius (currently `0.375rem` = `rounded-md`) |

---

## Adding a new theme

1. **Add the ID** to `src/lib/theme/theme-types.ts`:

```ts
export type ThemeId = 'system' | 'light' | 'dark' | 'ocean' | 'forest' | 'sunset';
```

2. **Register the theme** in `src/lib/theme/themes.ts`:

```ts
import { SunsetIcon } from './theme-icons';

export const THEMES: readonly Theme[] = [
  // ... existing themes
  { id: 'sunset', label: 'Sunset', Icon: SunsetIcon },
];
```

3. **Add an icon** in `src/lib/theme/theme-icons.tsx` following the same SVG pattern.

4. **Add the CSS block** in `app/globals.css`:

```css
[data-theme="sunset"] {
  --background:           #fff7ed;
  --foreground:           #7c2d12;
  /* ... all tokens must be defined */
}
```

5. **Update `docs/06-theming.md`** — add the new theme to the Available themes table.

> Every theme block must define **all** tokens. Partial overrides lead to inheritance bugs.

---

## The anti-flash script

`app/layout.tsx` injects a tiny inline `<script>` into `<head>` that runs synchronously before React. It reads the stored theme and sets `data-theme` on `<html>` before the browser paints. This prevents the flash of light theme on users who prefer dark.

The script is built from the canonical TypeScript constants (storage key, valid IDs, system sentinel) — it stays correct automatically when you add or rename themes.

`suppressHydrationWarning` on `<html>` is intentional — the script mutates `data-theme` before React hydrates, causing a controlled mismatch that React would otherwise warn about.

---

## ThemeSwitcher component

The `ThemeSwitcher` component renders the theme buttons. It can be added to any page via the schema:

```json
{
  "id": "my-theme-switcher",
  "type": "theme-switcher",
  "props": {
    "metadata": {
      "groupLabel": "Choose a theme",
      "visibleThemes": ["light", "dark", "ocean"]
    }
  }
}
```

See [Components](./04-components.md#themeswitcher) for the full schema reference.
