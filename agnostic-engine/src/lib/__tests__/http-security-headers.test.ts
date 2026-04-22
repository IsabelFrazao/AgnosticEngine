import { describe, expect, it } from 'vitest';
import {
  buildContentSecurityPolicy,
  getSecurityHeaders,
} from '@/src/lib/http-security-headers';

describe('http-security-headers', () => {
  it('includes frame-ancestors and connect-src in CSP', () => {
    const csp = buildContentSecurityPolicy(false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("connect-src 'self'");
  });

  it('allows eval in development CSP only', () => {
    expect(buildContentSecurityPolicy(true)).toContain("'unsafe-eval'");
    expect(buildContentSecurityPolicy(false)).not.toContain("'unsafe-eval'");
  });

  it('adds HSTS outside development', () => {
    const prod = getSecurityHeaders(false);
    const dev = getSecurityHeaders(true);

    expect(prod.some((h) => h.key === 'Strict-Transport-Security')).toBe(true);
    expect(dev.some((h) => h.key === 'Strict-Transport-Security')).toBe(false);
  });
});
