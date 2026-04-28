import type { ReactNode } from 'react';
import type { MetadataComponentProps } from '@/src/lib/metadata-types';
import { parseTableMetadata } from '@/src/lib/metadata/parse-table-metadata';
import { FormattedUtc, parseUtcIso } from '@agnostic/ui-kit';

function renderTableCellValue(value: unknown): ReactNode {
  if (typeof value === 'string' && parseUtcIso(value)) {
    return <FormattedUtc iso={value} />;
  }
  return String(value ?? '');
}

export function Table({ metadata, requiredPermissions }: MetadataComponentProps) {
  void requiredPermissions;
  const { columns, rows, caption } = parseTableMetadata(metadata);

  const fallbackLabel = `Table with columns: ${columns.join(', ')}`;

  return (
    <table
      className="w-full border-collapse border border-(--color-table-border) text-sm"
      aria-label={!caption ? fallbackLabel : undefined}
    >
      {caption && <caption className="mb-2 text-left text-sm font-medium text-(--color-foreground)">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              scope="col"
              className="border border-(--color-table-border) bg-(--color-table-header) px-3 py-2 text-left font-medium"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={columns.map((c) => String(row[c] ?? '')).join('||')}>
            {columns.map((c) => (
              <td
                key={c}
                className="border border-(--color-table-border) px-3 py-2"
              >
                {renderTableCellValue(row[c])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
