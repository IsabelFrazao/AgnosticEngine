import { MOCK_LAYOUT } from '@/src/data/mock-data';
import { migrateLayout } from '@/src/lib/metadata/migrate-layout';
import { LayoutSchema, type Layout } from '@/src/schemas/page.schema';

/**
 * Loads and validates the shared layout document.
 * Today backed by mock data; swap the source when the API/DB is wired.
 */
export function getLayout(): Layout {
  return LayoutSchema.parse(migrateLayout(MOCK_LAYOUT));
}
