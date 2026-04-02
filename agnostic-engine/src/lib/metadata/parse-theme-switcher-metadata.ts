import { THEME_IDS } from '@/src/lib/theme/themes';
import type { ThemeId, ThemeSwitcherMetadata } from '@/src/lib/theme/theme-types';

export type { ThemeSwitcherMetadata };

export function parseThemeSwitcherMetadata(
  raw: Record<string, unknown> | undefined,
): ThemeSwitcherMetadata {
  const safeRaw = raw ?? {};
  const { visibleThemes, groupLabel } = safeRaw;

  if (visibleThemes !== undefined) {
    const isValid =
      Array.isArray(visibleThemes) &&
      visibleThemes.length > 0 &&
      visibleThemes.every((v) => typeof v === 'string' && THEME_IDS.has(v as ThemeId));

    if (!isValid) {
      throw new TypeError(
        `ThemeSwitcherMetadata: "visibleThemes" must be a non-empty array of valid ThemeIds, received ${JSON.stringify(visibleThemes)}`,
      );
    }
  }

  if (groupLabel !== undefined && (typeof groupLabel !== 'string' || groupLabel.trim() === '')) {
    throw new TypeError(
      `ThemeSwitcherMetadata: "groupLabel" must be a non-empty string, received ${JSON.stringify(groupLabel)}`,
    );
  }

  return {
    ...(visibleThemes !== undefined && { visibleThemes: visibleThemes as ThemeId[] }),
    ...(groupLabel !== undefined && { groupLabel }),
  };
}
