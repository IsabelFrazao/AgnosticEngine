import { describe, expect, it } from 'vitest';
import { GET as getLayout } from '@/app/api/layout/route';
import { GET as getPages } from '@/app/api/pages/route';
import { GET as getPageBySlug } from '@/app/api/page/[...slug]/route';

describe('API schema version contracts', () => {
  it('returns layout with schemaVersion', async () => {
    const response = getLayout();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.schemaVersion).toBe('1.0');
  });

  it('returns pages manifest with schemaVersion for each entry', async () => {
    const response = getPages(
      new Request('http://localhost/api/pages', {
        headers: { 'x-ae-permissions': 'courses:read' },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body['/'].schemaVersion).toBe('1.0');
    expect(body['/courses'].schemaVersion).toBe('1.0');
  });

  it('returns page payload with schemaVersion', async () => {
    const response = await getPageBySlug(
      new Request('http://localhost/api/page/courses', {
        headers: { 'x-ae-permissions': 'courses:read' },
      }),
      {
        params: Promise.resolve({ slug: ['courses'] }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.schemaVersion).toBe('1.0');
  });

  it('returns 404 JSON for unknown page slug', async () => {
    const response = await getPageBySlug(new Request('http://localhost/api/page/does-not-exist'), {
      params: Promise.resolve({ slug: ['does-not-exist'] }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Page not found');
    expect(body.path).toBe('/does-not-exist');
  });

  it('returns 403 for page payload when user lacks page permissions', async () => {
    const response = await getPageBySlug(
      new Request('http://localhost/api/page/courses', {
        headers: { 'x-ae-permissions': 'profile:read' },
      }),
      {
        params: Promise.resolve({ slug: ['courses'] }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Forbidden');
    expect(body.path).toBe('/courses');
  });

  it('filters pages manifest based on current user permissions', async () => {
    const response = getPages(
      new Request('http://localhost/api/pages', {
        headers: { 'x-ae-permissions': 'profile:read' },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(body)).toEqual(['/']);
  });

  it('returns only public pages when permissions are omitted', async () => {
    const response = getPages(new Request('http://localhost/api/pages'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(body)).toEqual(['/']);
  });
});
