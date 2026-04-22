import { NextResponse, type NextRequest } from 'next/server';
import { MOCK_PAGES } from '@/src/data/mock-data';

type RouteContext = { params: Promise<{ slug: string[] }> };

/**
 * GET /api/page/:slug
 *
 * Returns the full page entry (header + components) for the given slug.
 * The slug segments are joined to reconstruct the page key (e.g. ["courses","modules"] → "/courses/modules").
 *
 * Returns 404 JSON if the slug is not in the pages manifest.
 * Replace MOCK_PAGES with a real DB/CMS query when the backend is ready.
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { slug } = await params;
  const path = `/${slug.join('/')}`;
  const page = MOCK_PAGES[path];

  if (!page) {
    return NextResponse.json({ error: 'Page not found', path }, { status: 404 });
  }

  return NextResponse.json(page);
}
