import { NextResponse } from 'next/server';
import { MOCK_LAYOUT } from '@/src/data/mock-data';

/**
 * GET /api/layout
 *
 * Returns the shared layout schema (navbar, footer, notifications, sidebar config).
 * Replace MOCK_LAYOUT with a real DB/CMS query when the backend is ready.
 */
export function GET(): NextResponse {
  return NextResponse.json(MOCK_LAYOUT);
}
