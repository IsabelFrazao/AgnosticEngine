import type { PublishedContentRepository, PublishedReadContext } from '../contracts';
import { MOCK_PUBLISHED_STORE } from '../mock-published-store';

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Transitional read repository.
 * M4 keeps renderer read contracts stable while swapping direct mock imports
 * for a data-access boundary that can be backed by a real DB adapter.
 */
export class InMemoryPublishedContentRepository implements PublishedContentRepository {
  getPublishedLayout(_context?: PublishedReadContext): unknown {
    return cloneValue(MOCK_PUBLISHED_STORE.layout);
  }

  getPublishedPagesManifest(_context?: PublishedReadContext): Record<string, unknown> {
    return cloneValue(MOCK_PUBLISHED_STORE.pages);
  }

  getPublishedPageByPath(path: string, _context?: PublishedReadContext): unknown | undefined {
    const pages = MOCK_PUBLISHED_STORE.pages as Record<string, unknown>;
    const page = pages[path];
    if (!page) {
      return undefined;
    }
    return cloneValue(page);
  }

  getPublishedUpdatedAt(_context?: PublishedReadContext): string {
    return MOCK_PUBLISHED_STORE.updatedAt;
  }
}
