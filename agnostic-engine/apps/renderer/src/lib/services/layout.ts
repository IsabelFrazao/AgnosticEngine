import { InMemoryPublishedContentRepository } from '@agnostic/data-access';
import { migrateLayout } from '@agnostic/metadata-schema';
import { LayoutSchema, type Layout } from '@/src/schemas/page.schema';

const publishedContentRepository = new InMemoryPublishedContentRepository();
type LegacyLayoutInput = Parameters<typeof migrateLayout>[0];

/**
 * Loads and validates the shared layout document.
 * Today backed by an in-memory data-access repository; swap that repository
 * implementation for a real DB adapter when infrastructure is ready.
 */
export function getLayout(): Layout {
  const rawLayout = publishedContentRepository.getPublishedLayout({ siteSlug: 'demo-site' }) as LegacyLayoutInput;
  return LayoutSchema.parse(migrateLayout(rawLayout));
}
