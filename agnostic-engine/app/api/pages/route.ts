import { NextResponse } from 'next/server';
import { getCurrentUserPermissionsFromRequest } from '@/src/lib/services/current-user';
import { getAuthorizedNavManifest } from '@/src/lib/services/pages';

/**
 * GET /api/pages
 *
 * Returns the pages manifest — slug, title, nav config, permissions — WITHOUT
 * component arrays. Consumers (e.g. Sidebar) only need the nav metadata, not
 * the full page content. Keeping components out of this response keeps it small.
 *
 * Backed by `getNavManifest()` today; point that service at a real DB/API when ready.
 */
export function GET(request: Request): NextResponse {
  try {
    const currentUserPermissions = getCurrentUserPermissionsFromRequest(request);
    return NextResponse.json(getAuthorizedNavManifest([...currentUserPermissions]));
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid pages manifest', details: String(error) },
      { status: 500 },
    );
  }
}
