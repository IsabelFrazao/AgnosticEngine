import { describe, expect, it } from 'vitest';
import { formatUtcLongLocal, parseUtcIso } from '../datetime/utc-display';

describe('ui-kit utc helpers', () => {
  it('parses a valid ISO timestamp', () => {
    const parsed = parseUtcIso('2026-04-01T12:00:00.000Z');
    expect(parsed).not.toBeNull();
  });

  it('returns null for invalid timestamp', () => {
    expect(parseUtcIso('invalid')).toBeNull();
  });

  it('formats a parsed date', () => {
    const parsed = parseUtcIso('2026-04-01T12:00:00.000Z');
    if (!parsed) throw new Error('Expected parsed date');
    expect(formatUtcLongLocal(parsed).length).toBeGreaterThan(0);
  });
});
