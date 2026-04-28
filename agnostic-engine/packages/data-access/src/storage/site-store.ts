import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { MOCK_PUBLISHED_STORE } from '../mock-published-store';

export type SiteContentSnapshot = {
  schemaVersion: string;
  layout: unknown;
  pages: Record<string, unknown>;
  updatedAt: string;
};

export type PublishEvent = {
  id: string;
  publishedAt: string;
  actorId?: string;
};

export type SiteStore = {
  siteSlug: string;
  draft: SiteContentSnapshot;
  published: SiteContentSnapshot;
  publishEvents: PublishEvent[];
};

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(MODULE_DIR, '../../../../');
const DATA_ROOT = path.join(REPO_ROOT, '.data', 'sites');

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sanitizeSlug(siteSlug: string): string {
  return siteSlug.replace(/[^a-zA-Z0-9-_]/g, '-');
}

function ensureDataRoot(): void {
  fs.mkdirSync(DATA_ROOT, { recursive: true });
}

function resolveNowIso(): string {
  return new Date().toISOString();
}

function createDefaultStore(siteSlug: string): SiteStore {
  const snapshot: SiteContentSnapshot = {
    schemaVersion: '1.0',
    layout: cloneValue(MOCK_PUBLISHED_STORE.layout),
    pages: cloneValue(MOCK_PUBLISHED_STORE.pages),
    updatedAt: resolveNowIso(),
  };

  return {
    siteSlug,
    draft: cloneValue(snapshot),
    published: cloneValue(snapshot),
    publishEvents: [],
  };
}

export function resolveSiteStorePath(siteSlug: string): string {
  ensureDataRoot();
  return path.join(DATA_ROOT, `${sanitizeSlug(siteSlug)}.json`);
}

export function readSiteStore(siteSlug: string): SiteStore {
  const filePath = resolveSiteStorePath(siteSlug);
  if (!fs.existsSync(filePath)) {
    const initial = createDefaultStore(siteSlug);
    writeSiteStore(siteSlug, initial);
    return initial;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as SiteStore;
}

export function writeSiteStore(siteSlug: string, store: SiteStore): SiteStore {
  const filePath = resolveSiteStorePath(siteSlug);
  const normalized = { ...store, siteSlug };
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf-8');
  return normalized;
}

export function cloneSiteSnapshot(snapshot: SiteContentSnapshot): SiteContentSnapshot {
  return cloneValue(snapshot);
}
