'use client';

import { useClientReady } from '@/src/hooks/useClientReady';
import { useTheme } from '@/src/hooks/useTheme';
import { parseThemeSwitcherMetadata } from '@/src/lib/metadata/parse-theme-switcher-metadata';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { THEMES } from '@/src/lib/theme/themes';
import type { ThemeId } from '@/src/lib/theme/theme-types';

// ── Styles ────────────────────────────────────────────────────────────────────

const BUTTON_BASE =
  'flex items-center gap-1.5 rounded-[var(--radius-brand)] px-3 py-1.5 ' +
  'text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]';

const BUTTON_ACTIVE = 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]';

const BUTTON_INACTIVE =
  'border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]';

// ── Skeleton ──────────────────────────────────────────────────────────────────
// Mirrors the shape of the real buttons while the component defers rendering
// until after hydration (prevents server/client aria-pressed mismatch).

const SKELETON_WIDTHS = ['w-20', 'w-16', 'w-16', 'w-20', 'w-20'] as const;

function ThemeSwitcherSkeleton({ groupLabel }: { groupLabel: string }) {
  return (
    <div role="group" aria-label={groupLabel} aria-busy="true" className="flex flex-wrap gap-2">
      {SKELETON_WIDTHS.map((w, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`h-8 ${w} animate-pulse rounded-[var(--radius-brand)] bg-[var(--color-skeleton)]`}
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
            onClick={() => setTheme(t.id as ThemeId)}
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
