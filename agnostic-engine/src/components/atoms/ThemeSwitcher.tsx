'use client';

import { useClientReady } from '@/src/hooks/useClientReady';
import { useTheme } from '@/src/hooks/useTheme';
import { parseThemeSwitcherMetadata } from '@/src/lib/metadata/parse-theme-switcher-metadata';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { THEMES } from '@/src/lib/theme/themes';

// ── Styles ────────────────────────────────────────────────────────────────────

// Note: Button.tsx uses a similar base pattern (same radius/ring/typography tokens)
// but differs in size (px-4 py-2) and has disabled states. Extract a shared
// buttonBaseClasses() utility to src/lib/ if a third button-like component appears.
const BUTTON_BASE =
  'flex items-center gap-1.5 rounded-(--radius-brand) px-3 py-1.5 ' +
  'text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)';

const BUTTON_ACTIVE = 'bg-(--color-primary) text-(--color-primary-foreground)';

const BUTTON_INACTIVE =
  'border border-(--color-border) text-(--color-foreground) hover:bg-(--color-muted)';

// ── Skeleton ──────────────────────────────────────────────────────────────────
// Mirrors the shape of the real buttons while the component defers rendering
// until after hydration (prevents server/client aria-pressed mismatch).
// Count is derived from THEMES so it stays in sync when themes are added/removed.

function ThemeSwitcherSkeleton({ groupLabel }: { groupLabel: string }) {
  return (
    <div role="group" aria-label={groupLabel} aria-busy="true" className="flex flex-wrap gap-2">
      {THEMES.map((t) => (
        <div
          key={t.id}
          aria-hidden="true"
          className="h-8 w-20 animate-pulse rounded-(--radius-brand) bg-(--color-skeleton)"
        />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeSwitcher({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;

  const { theme, setTheme } = useTheme();
  const { visibleThemes, groupLabel = 'Theme' } = parseThemeSwitcherMetadata(metadata);

  // Defer rendering until after hydration so that aria-pressed reflects the
  // client-side stored theme, not the server-rendered default ('system').
  const clientReady = useClientReady();

  if (!clientReady) return <ThemeSwitcherSkeleton groupLabel={groupLabel} />;

  const displayThemes = visibleThemes
    ? THEMES.filter((t) => visibleThemes.includes(t.id))
    : THEMES;

  return (
    <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
      {displayThemes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            // Theme switching is infrastructure (not business logic) and requires
            // reading `theme` state for aria-pressed — ActionRegistry is bypassed
            // intentionally here; setTheme is the registry for this concern.
            onClick={() => setTheme(t.id)}
            aria-pressed={isActive}
            aria-label={`Switch to ${t.label} theme`}
            className={`${BUTTON_BASE} ${isActive ? BUTTON_ACTIVE : BUTTON_INACTIVE}`}
          >
            <t.Icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
