import type { MetadataSchemaItem } from '@/src/lib/metadata-types';
import { MetadataEngineItem } from '@/src/components/MetadataEngineItem';

export function MetadataEngine({ schema }: { schema: MetadataSchemaItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {schema.map((item) => (
        <MetadataEngineItem key={item.id} item={item} />
      ))}
    </div>
  );
}
