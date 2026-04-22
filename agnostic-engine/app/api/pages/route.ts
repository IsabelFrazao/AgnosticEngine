import { NextResponse } from 'next/server';
import { MOCK_PAGES } from '@/src/data/mock-data';
import type { NavManifest } from '@/src/schemas/page.schema';
import { migratePageManifestEntry } from '@/src/lib/metadata/migrate-page-manifest-entry';

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
  try {
    const manifest: NavManifest = Object.fromEntries(
      Object.entries(MOCK_PAGES).map(([slug, page]) => {
        const migrated = migratePageManifestEntry(page);
        return [
          slug,
          {
            schemaVersion: migrated.schemaVersion,
            title: migrated.title,
            nav: migrated.nav,
            permissions: migrated.permissions,
          },
        ];
      }),
    );

    return NextResponse.json(manifest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid page schema version', details: String(error) },
      { status: 500 },
    );
  }
}
