export type PublishedReadContext = {
  siteSlug?: string;
  versionId?: string;
  previewToken?: string;
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
