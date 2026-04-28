import type { DraftContentRepository, DraftSiteVersion, DraftWriteContext } from '../contracts';
import { cloneSiteSnapshot, readSiteStore, writeSiteStore } from '../storage/site-store';

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function resolveNowIso(): string {
  return new Date().toISOString();
}

function resolveSiteSlug(context: DraftWriteContext): string {
  return context.siteSlug.trim() || 'demo-site';
}

/**
 * Transitional in-memory builder draft repository.
 * Replace with DB-backed draft/version tables in later phases.
 */
export class InMemoryDraftContentRepository implements DraftContentRepository {
  getDraftSiteVersion(context: DraftWriteContext): DraftSiteVersion {
    const siteSlug = resolveSiteSlug(context);
    const store = readSiteStore(siteSlug);
    const draft = cloneSiteSnapshot(store.draft);
    return {
      siteSlug,
      schemaVersion: draft.schemaVersion,
      layout: draft.layout,
      pages: draft.pages,
      updatedAt: draft.updatedAt,
    };
  }

  saveDraftSiteVersion(
    context: DraftWriteContext,
    input: Pick<DraftSiteVersion, 'layout' | 'pages' | 'schemaVersion'>,
  ): DraftSiteVersion {
    const siteSlug = resolveSiteSlug(context);
    const store = readSiteStore(siteSlug);
    const nextDraft = {
      schemaVersion: input.schemaVersion,
      layout: cloneValue(input.layout),
      pages: cloneValue(input.pages),
      updatedAt: resolveNowIso(),
    };
    const nextStore = writeSiteStore(siteSlug, {
      ...store,
      draft: nextDraft,
    });
    return {
      siteSlug,
      schemaVersion: nextStore.draft.schemaVersion,
      layout: cloneValue(nextStore.draft.layout),
      pages: cloneValue(nextStore.draft.pages),
      updatedAt: nextStore.draft.updatedAt,
    };
  }

  publishDraftSiteVersion(context: DraftWriteContext): DraftSiteVersion {
    const siteSlug = resolveSiteSlug(context);
    const store = readSiteStore(siteSlug);
    const publishedAt = resolveNowIso();

    const nextStore = writeSiteStore(siteSlug, {
      ...store,
      published: {
        ...cloneSiteSnapshot(store.draft),
        updatedAt: publishedAt,
      },
      publishEvents: [
        ...store.publishEvents,
        {
          id: `${siteSlug}-${Date.now()}`,
          publishedAt,
          actorId: context.actorId,
        },
      ],
    });

    return {
      siteSlug,
      schemaVersion: nextStore.published.schemaVersion,
      layout: cloneValue(nextStore.published.layout),
      pages: cloneValue(nextStore.published.pages),
      updatedAt: nextStore.published.updatedAt,
    };
  }
}
