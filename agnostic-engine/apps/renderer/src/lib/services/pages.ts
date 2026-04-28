import { DEMO_UPDATED_AT, MOCK_PAGES } from '@/src/data/mock-data';
import { evaluatePermissionAccess } from '@agnostic/engine-core';
import { migratePageManifestEntry } from '@/src/lib/metadata/migrate-page-manifest-entry';
import {
  PagesManifestSchema,
  type NavManifest,
  type PageManifestEntry,
  type PagesManifest,
} from '@/src/schemas/page.schema';

let pagesManifestCache: PagesManifest | undefined;

function loadPagesManifest(): PagesManifest {
  if (!pagesManifestCache) {
    const migrated = Object.fromEntries(
      Object.entries(MOCK_PAGES).map(([slug, page]) => [
        slug,
        migratePageManifestEntry(page),
      ]),
    );
    pagesManifestCache = PagesManifestSchema.parse(migrated);
  }
  return pagesManifestCache;
}

/**
 * Full pages manifest (Law of Derivation). Validated on read.
 * Today backed by mock data; swap the source when the API/DB is wired.
 */
export function getPagesManifest(): PagesManifest {
  return loadPagesManifest();
}

/** Slim nav view for the sidebar (no component trees). */
export function getNavManifest(): NavManifest {
  const pages = loadPagesManifest();
  return Object.fromEntries(
    Object.entries(pages).map(([slug, page]) => [
      slug,
      {
        schemaVersion: page.schemaVersion,
        title: page.title,
        nav: page.nav,
        permissions: page.permissions,
      },
    ]),
  );
}

/** Permission-aware nav view for the current user. */
export function getAuthorizedNavManifest(currentUserPermissions: string[]): NavManifest {
  const pages = loadPagesManifest();

  return Object.fromEntries(
    Object.entries(pages)
      .filter(([, page]) => evaluatePermissionAccess(page.permissions, currentUserPermissions).allowed)
      .map(([slug, page]) => [
        slug,
        {
          schemaVersion: page.schemaVersion,
          title: page.title,
          nav: page.nav,
          permissions: page.permissions,
        },
      ]),
  );
}

export function getPageEntry(path: string): PageManifestEntry | undefined {
  return loadPagesManifest()[path];
}

export function canAccessPageEntry(
  page: PageManifestEntry,
  currentUserPermissions: string[],
): boolean {
  return evaluatePermissionAccess(page.permissions, currentUserPermissions).allowed;
}

export function getHomePageEntry(): PageManifestEntry {
  const home = loadPagesManifest()['/'];
  if (!home) {
    throw new TypeError('Pages manifest is missing required "/" entry');
  }
  return home;
}

/** Params for `generateStaticParams` on the catch-all route (excludes `/`). */
export function getStaticPathParams(): { slug: string[] }[] {
  return Object.keys(loadPagesManifest())
    .filter((slug) => slug !== '/')
    .map((slug) => ({
      slug: slug.replace(/^\//, '').split('/'),
    }));
}

export { DEMO_UPDATED_AT };
