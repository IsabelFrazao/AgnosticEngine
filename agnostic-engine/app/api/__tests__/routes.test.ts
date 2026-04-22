import { describe, expect, it } from 'vitest';
import { GET as getLayout } from '@/app/api/layout/route';
import { GET as getPages } from '@/app/api/pages/route';
import { GET as getPageBySlug } from '@/app/api/page/[...slug]/route';
import type { NextRequest } from 'next/server';

describe('API schema version contracts', () => {
  it('returns layout with schemaVersion', async () => {
    const response = getLayout();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.schemaVersion).toBe('1.0');
  });

  it('returns pages manifest with schemaVersion for each entry', async () => {
    const response = getPages();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body['/'].schemaVersion).toBe('1.0');
    expect(body['/courses'].schemaVersion).toBe('1.0');
  });

  it('returns page payload with schemaVersion', async () => {
    const response = await getPageBySlug({} as NextRequest, {
      params: Promise.resolve({ slug: ['courses'] }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.schemaVersion).toBe('1.0');
  });
});
