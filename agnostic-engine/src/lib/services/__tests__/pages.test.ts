import { describe, expect, it } from 'vitest';
import {
  getHomePageEntry,
  getNavManifest,
  getPageEntry,
  getPagesManifest,
  getStaticPathParams,
} from '@/src/lib/services/pages';

describe('pages service', () => {
  it('returns a validated manifest with home and courses', () => {
    const manifest = getPagesManifest();
    expect(manifest['/']).toBeDefined();
    expect(manifest['/'].schemaVersion).toBe('1.0');
    expect(manifest['/courses']).toBeDefined();
  });

  it('getHomePageEntry returns the root page', () => {
    const home = getHomePageEntry();
    expect(home.nav?.label).toBe('Home');
  });

  it('getPageEntry returns undefined for unknown paths', () => {
    expect(getPageEntry('/nope')).toBeUndefined();
  });

  it('getNavManifest carries schemaVersion per slug', () => {
    const nav = getNavManifest();
    expect(nav['/'].schemaVersion).toBe('1.0');
  });

  it('getStaticPathParams omits root', () => {
    const params = getStaticPathParams();
    expect(params.some((p) => p.slug.join('/') === '')).toBe(false);
    expect(params.some((p) => p.slug.join('/') === 'courses')).toBe(true);
  });
});
