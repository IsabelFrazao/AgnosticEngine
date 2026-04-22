/**
 * Baseline HTTP security headers for Next.js `headers()` config.
 * Keep policy construction here so it stays testable and single-sourced.
 */

export function buildContentSecurityPolicy(isDevelopment: boolean): string {
  const scriptSrc = isDevelopment
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    scriptSrc,
    "connect-src 'self'",
  ].join('; ');
}

export type SecurityHeader = { key: string; value: string };

export function getSecurityHeaders(isDevelopment: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: 'Content-Security-Policy',
      value: buildContentSecurityPolicy(isDevelopment),
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
  ];

  if (!isDevelopment) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    });
  }

  return headers;
}
