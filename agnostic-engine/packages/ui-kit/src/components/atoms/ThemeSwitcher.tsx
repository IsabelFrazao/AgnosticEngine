'use client';

import { useClientReady } from '../../hooks/use-client-ready';
import { useTheme } from '../../theme/theme-context';
import { THEMES } from '../../theme/themes';
import type { ThemeId } from '../../theme/theme-types';

const BUTTON_BASE =
  'flex items-center gap-1.5 rounded-(--radius-brand) px-3 py-1.5 ' +
  'text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)';
const BUTTON_ACTIVE = 'bg-(--color-primary) text-(--color-primary-foreground)';
const BUTTON_INACTIVE = 'border border-(--color-border) text-(--color-foreground) hover:bg-(--color-muted)';

type Props = {
  visibleThemes?: ThemeId[];
  groupLabel?: string;
};

function ThemeSwitcherSkeleton({ groupLabel }: { groupLabel: string }) {
  return (
    <div role="group" aria-label={groupLabel} aria-busy="true" className="flex flex-wrap gap-2">
      {THEMES.map((theme) => (
        <div
          key={theme.id}
          aria-hidden="true"
          className="h-8 w-20 animate-pulse rounded-(--radius-brand) bg-(--color-skeleton)"
        />
      ))}
    </div>
  );
}

export function ThemeSwitcher({ visibleThemes, groupLabel = 'Theme' }: Props) {
  const { theme, setTheme } = useTheme();
  const clientReady = useClientReady();

  if (!clientReady) return <ThemeSwitcherSkeleton groupLabel={groupLabel} />;

  const displayThemes = visibleThemes ? THEMES.filter((t) => visibleThemes.includes(t.id)) : THEMES;

  return (
    <div role="group" aria-label={groupLabel} className="flex flex-wrap gap-2">
      {displayThemes.map((displayTheme) => {
        const isActive = theme === displayTheme.id;
        return (
          <button
            key={displayTheme.id}
            type="button"
            onClick={() => setTheme(displayTheme.id)}
            aria-pressed={isActive}
            aria-label={`Switch to ${displayTheme.label} theme`}
            className={`${BUTTON_BASE} ${isActive ? BUTTON_ACTIVE : BUTTON_INACTIVE}`}
          >
            <displayTheme.Icon className="h-4 w-4" aria-hidden="true" />
            {displayTheme.label}
          </button>
        );
      })}
    </div>
  );
}
