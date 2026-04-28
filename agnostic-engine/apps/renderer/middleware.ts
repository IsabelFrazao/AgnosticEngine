import { NextResponse } from 'next/server';

/**
 * Request boundary scaffold for auth, tenancy, and rate limiting.
 * No rules are enforced yet — extend here instead of scattering checks in routes.
 */
export function middleware(): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
