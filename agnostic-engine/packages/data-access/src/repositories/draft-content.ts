import type { DraftContentRepository, DraftSiteVersion, DraftWriteContext } from '../contracts';
import { MOCK_PUBLISHED_STORE } from '../mock-published-store';

const DEFAULT_SITE_SLUG = 'demo-site';
const DEFAULT_SCHEMA_VERSION = '1.0';

const draftStore = new Map<string, DraftSiteVersion>();

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveNowIso(): string {
  return new Date().toISOString();
}

function ensureDraft(context: DraftWriteContext): DraftSiteVersion {
  const existing = draftStore.get(context.siteSlug);
  if (existing) {
    return existing;
  }

  const initial: DraftSiteVersion = {
    siteSlug: context.siteSlug || DEFAULT_SITE_SLUG,
    schemaVersion: DEFAULT_SCHEMA_VERSION,
    layout: cloneValue(MOCK_PUBLISHED_STORE.layout),
    pages: cloneValue(MOCK_PUBLISHED_STORE.pages),
    updatedAt: resolveNowIso(),
  };

  draftStore.set(context.siteSlug, initial);
  return initial;
}

/**
 * Transitional in-memory builder draft repository.
 * Replace with DB-backed draft/version tables in later phases.
 */
export class InMemoryDraftContentRepository implements DraftContentRepository {
  getDraftSiteVersion(context: DraftWriteContext): DraftSiteVersion {
    return cloneValue(ensureDraft(context));
  }

  saveDraftSiteVersion(
    context: DraftWriteContext,
    input: Pick<DraftSiteVersion, 'layout' | 'pages' | 'schemaVersion'>,
  ): DraftSiteVersion {
    const next: DraftSiteVersion = {
      siteSlug: context.siteSlug,
      schemaVersion: input.schemaVersion,
      layout: cloneValue(input.layout),
      pages: cloneValue(input.pages),
      updatedAt: resolveNowIso(),
    };
    draftStore.set(context.siteSlug, next);
    return cloneValue(next);
  }
}
