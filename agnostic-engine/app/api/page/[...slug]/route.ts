import { NextResponse } from 'next/server';
import { canAccessPageEntry, getPageEntry } from '@/src/lib/services/pages';
import { getCurrentUserPermissionsFromRequest } from '@/src/lib/services/current-user';

type RouteContext = { params: Promise<{ slug: string[] }> };

/**
 * GET /api/page/:slug
 *
 * Returns the full page entry (header + components) for the given slug.
 * The slug segments are joined to reconstruct the page key (e.g. ["courses","modules"] → "/courses/modules").
 *
 * Returns 404 JSON if the slug is not in the pages manifest.
 */
export async function GET(
  req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { slug } = await params;
  const path = `/${slug.join('/')}`;

  try {
    const page = getPageEntry(path);

    if (!page) {
      return NextResponse.json({ error: 'Page not found', path }, { status: 404 });
    }

    const currentUserPermissions = getCurrentUserPermissionsFromRequest(req);
    if (!canAccessPageEntry(page, [...currentUserPermissions])) {
      return NextResponse.json({ error: 'Forbidden', path }, { status: 403 });
    }

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid page payload', path, details: String(error) },
      { status: 500 },
    );
  }
}
