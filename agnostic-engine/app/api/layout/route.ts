import { NextResponse } from 'next/server';
import { getLayout } from '@/src/lib/services/layout';

/**
 * GET /api/layout
 *
 * Returns the shared layout schema (navbar, footer, notifications, sidebar config).
 * Backed by `getLayout()` today; point that service at a real DB/API when ready.
 */
export function GET(): NextResponse {
  try {
    return NextResponse.json(getLayout());
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid layout payload', details: String(error) },
      { status: 500 },
    );
  }
}
