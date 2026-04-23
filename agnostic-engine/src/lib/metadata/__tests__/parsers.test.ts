import { describe, expect, it } from 'vitest';
import { parseButtonMetadata } from '@/src/lib/metadata/parse-button-metadata';
import { parseTableMetadata } from '@/src/lib/metadata/parse-table-metadata';
import { parseThemeSwitcherMetadata } from '@/src/lib/metadata/parse-theme-switcher-metadata';

describe('metadata parsers', () => {
  it('parses valid button metadata and preserves optional fields', () => {
    const parsed = parseButtonMetadata({
      labelKey: 'Publish module',
      variant: 'primary',
      actionId: 'courses:publish',
      isDisabled: false,
    });

    expect(parsed).toEqual({
      labelKey: 'Publish module',
      variant: 'primary',
      actionId: 'courses:publish',
      isDisabled: false,
    });
  });

  it('rejects invalid button metadata variant', () => {
    expect(() =>
      parseButtonMetadata({
        labelKey: 'Invalid',
        variant: 'danger',
      }),
    ).toThrow();
  });

  it('parses table metadata with typed columns and rows', () => {
    const parsed = parseTableMetadata({
      columns: ['Module', 'Status'],
      rows: [{ Module: 'React 19', Status: 'Draft' }],
    });

    expect(parsed.columns).toEqual(['Module', 'Status']);
    expect(parsed.rows).toHaveLength(1);
  });

  it('accepts undefined theme-switcher metadata as defaults', () => {
    expect(parseThemeSwitcherMetadata(undefined)).toEqual({});
  });
});
