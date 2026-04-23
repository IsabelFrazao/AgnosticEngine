import { cookies, headers } from 'next/headers';
import { MOCK_CURRENT_USER_PERMISSIONS } from '@/src/data/mock-auth';

const PERMISSIONS_HEADER_KEY = 'x-ae-permissions';
const PERMISSIONS_COOKIE_KEY = 'ae_permissions';

function parsePermissionList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(',').map((value) => value.trim()).filter(Boolean))];
}

/**
 * Resolves effective permissions for the current identity.
 *
 * Resolution order (first non-empty wins):
 * 1) Explicit request header (`x-ae-permissions`)
 * 2) Cookie (`ae_permissions`)
 * 3) Local demo fallback (`MOCK_CURRENT_USER_PERMISSIONS`)
 */
function resolvePermissions(
  headerValue: string | null | undefined,
  cookieValue: string | null | undefined,
): readonly string[] {
  const fromHeader = parsePermissionList(headerValue);
  if (fromHeader.length > 0) return fromHeader;

  const fromCookie = parsePermissionList(cookieValue);
  if (fromCookie.length > 0) return fromCookie;

  return MOCK_CURRENT_USER_PERMISSIONS;
}

export function getCurrentUserPermissionsFromRequest(request: Request): readonly string[] {
  const headerValue = request.headers.get(PERMISSIONS_HEADER_KEY);
  const cookieHeader = request.headers.get('cookie');
  const cookieValue =
    cookieHeader
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${PERMISSIONS_COOKIE_KEY}=`))
      ?.split('=')
      .slice(1)
      .join('=') ?? null;

  return resolvePermissions(headerValue, cookieValue);
}

/**
 * Server-side session permission lookup for RSC and server actions.
 */
export async function getCurrentUserPermissions(): Promise<readonly string[]> {
  const requestHeaders = await headers();
  const requestCookies = await cookies();

  return resolvePermissions(
    requestHeaders.get(PERMISSIONS_HEADER_KEY),
    requestCookies.get(PERMISSIONS_COOKIE_KEY)?.value,
  );
}
