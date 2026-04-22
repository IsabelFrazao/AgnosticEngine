import { NextResponse } from 'next/server';
import { MOCK_PAGES } from '@/src/data/mock-data';
import type { NavManifest } from '@/src/schemas/page.schema';

/**
 * GET /api/pages
 *
 * Returns the pages manifest — slug, title, nav config, permissions — WITHOUT
 * component arrays. Consumers (e.g. Sidebar) only need the nav metadata, not
 * the full page content. Keeping components out of this response keeps it small.
 *
 * Replace MOCK_PAGES with a real DB/CMS query when the backend is ready.
 */
export function GET(): NextResponse {
  const manifest: NavManifest = Object.fromEntries(
    Object.entries(MOCK_PAGES).map(([slug, page]) => [
      slug,
      { title: page.title, nav: page.nav, permissions: page.permissions },
    ]),
  );

  return NextResponse.json(manifest);
}
