import type { MetadataSchemaItem } from '@/src/lib/metadata-types';
import { MetadataEngineItem } from '@/src/components/MetadataEngineItem';

/**
 * Renders top-level metadata roots. Each node (including nested `children`) is validated
 * with `MetadataNodeSchema` in `MetadataEngineItem`, then sanitized and rendered — see
 * `src/schemas/root.schema.ts`.
 */
export function MetadataEngine({ schema }: { schema: MetadataSchemaItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {schema.map((item) => (
        <MetadataEngineItem key={item.id} item={item} />
      ))}
    </div>
  );
}
