'use client';

import { parseThemeSwitcherMetadata } from '@/src/lib/metadata/parse-theme-switcher-metadata';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { ThemeSwitcher as UiThemeSwitcher } from '@agnostic/ui-kit';

export function ThemeSwitcher({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { visibleThemes, groupLabel = 'Theme' } = parseThemeSwitcherMetadata(metadata);
  return <UiThemeSwitcher visibleThemes={visibleThemes} groupLabel={groupLabel} />;
}
