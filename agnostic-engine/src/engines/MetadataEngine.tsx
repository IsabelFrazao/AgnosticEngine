import type { MetadataSchemaItem } from '@/src/lib/metadata-types';
import { MetadataEngineItem } from '@/src/engines/MetadataEngineItem';

/**
 * Top-level renderer. Responsibility: iterate a schema array and delegate
 * each node to MetadataEngineItem. Knows nothing about types, components,
 * validation, or rendering logic — that belongs in the engine item and registries.
 */
export function MetadataEngine({
  schema,
  currentUserPermissions,
}: {
  schema: MetadataSchemaItem[];
  currentUserPermissions?: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {schema.map((item) => (
        <MetadataEngineItem
          key={item.id}
          item={item}
          currentUserPermissions={currentUserPermissions}
        />
      ))}
    </div>
  );
}
