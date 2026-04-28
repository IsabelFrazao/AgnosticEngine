import type { PublishedContentRepository, PublishedReadContext } from '../contracts';
import { cloneSiteSnapshot, readSiteStore } from '../storage/site-store';

function resolveSiteSlug(context?: PublishedReadContext): string {
  return context?.siteSlug?.trim() || 'demo-site';
}

/**
 * Transitional read repository.
 * M4 keeps renderer read contracts stable while swapping direct mock imports
 * for a data-access boundary that can be backed by a real DB adapter.
 */
export class InMemoryPublishedContentRepository implements PublishedContentRepository {
  getPublishedLayout(context?: PublishedReadContext): unknown {
    const store = readSiteStore(resolveSiteSlug(context));
    return cloneSiteSnapshot(store.published).layout;
  }

  getPublishedPagesManifest(context?: PublishedReadContext): Record<string, unknown> {
    const store = readSiteStore(resolveSiteSlug(context));
    return cloneSiteSnapshot(store.published).pages;
  }

  getPublishedPageByPath(path: string, context?: PublishedReadContext): unknown | undefined {
    const store = readSiteStore(resolveSiteSlug(context));
    const pages = cloneSiteSnapshot(store.published).pages;
    const page = pages[path];
    if (!page) {
      return undefined;
    }
    return page;
  }

  getPublishedUpdatedAt(context?: PublishedReadContext): string {
    const store = readSiteStore(resolveSiteSlug(context));
    return store.published.updatedAt;
  }
}
