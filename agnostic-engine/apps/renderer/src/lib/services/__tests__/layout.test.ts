import { describe, expect, it } from 'vitest';
import { getLayout } from '@/src/lib/services/layout';

describe('layout service', () => {
  it('returns a validated layout with schemaVersion', () => {
    const layout = getLayout();
    expect(layout.schemaVersion).toBe('1.0');
    expect(Array.isArray(layout.sidebar.extras)).toBe(true);
  });
});
