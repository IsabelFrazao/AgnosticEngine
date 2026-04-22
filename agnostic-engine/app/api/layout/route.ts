import { NextResponse } from 'next/server';
import { MOCK_LAYOUT } from '@/src/data/mock-data';
import { migrateLayout } from '@/src/lib/metadata/migrate-layout';

/**
 * GET /api/layout
 *
 * Returns the shared layout schema (navbar, footer, notifications, sidebar config).
 * Replace MOCK_LAYOUT with a real DB/CMS query when the backend is ready.
 */
export function GET(): NextResponse {
  try {
    return NextResponse.json(migrateLayout(MOCK_LAYOUT));
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid layout schema version', details: String(error) },
      { status: 500 },
    );
  }
}
