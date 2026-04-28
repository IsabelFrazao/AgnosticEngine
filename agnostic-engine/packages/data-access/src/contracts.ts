export type PublishedReadContext = {
  siteSlug?: string;
  versionId?: string;
  previewToken?: string;
};

export type DraftWriteContext = {
  siteSlug: string;
  tenantId?: string;
  actorId?: string;
};

export type DraftSiteVersion = {
  siteSlug: string;
  schemaVersion: string;
  layout: unknown;
  pages: Record<string, unknown>;
  updatedAt: string;
};

/**
 * Renderer-facing read boundary.
 * Builder write workflows must live in separate write-oriented contracts.
 */
export type PublishedContentRepository = {
  getPublishedLayout(context?: PublishedReadContext): unknown;
  getPublishedPagesManifest(context?: PublishedReadContext): Record<string, unknown>;
  getPublishedPageByPath(path: string, context?: PublishedReadContext): unknown | undefined;
  getPublishedUpdatedAt(context?: PublishedReadContext): string;
};

/**
 * Builder-facing draft boundary.
 * Builder writes drafts; renderer must not use these methods.
 */
export type DraftContentRepository = {
  getDraftSiteVersion(context: DraftWriteContext): DraftSiteVersion;
  saveDraftSiteVersion(
    context: DraftWriteContext,
    input: Pick<DraftSiteVersion, 'layout' | 'pages' | 'schemaVersion'>,
  ): DraftSiteVersion;
  publishDraftSiteVersion(context: DraftWriteContext): DraftSiteVersion;
};
