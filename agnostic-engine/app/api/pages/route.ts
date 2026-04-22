import { NextResponse } from 'next/server';
import { getNavManifest } from '@/src/lib/services/pages';

/**
 * GET /api/pages
 *
 * Returns the pages manifest — slug, title, nav config, permissions — WITHOUT
 * component arrays. Consumers (e.g. Sidebar) only need the nav metadata, not
 * the full page content. Keeping components out of this response keeps it small.
 *
 * Backed by `getNavManifest()` today; point that service at a real DB/API when ready.
 */
export function GET(): NextResponse {
  try {
    return NextResponse.json(getNavManifest());
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid pages manifest', details: String(error) },
      { status: 500 },
    );
  }
}
