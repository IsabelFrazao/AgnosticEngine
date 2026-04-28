import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { parseTableMetadata } from '@/src/lib/metadata/parse-table-metadata';
import { Table as UiTable } from '@agnostic/ui-kit';

export function Table({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { columns, rows, caption } = parseTableMetadata(metadata);
  return <UiTable columns={columns} rows={rows} caption={caption} />;
}
